import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
// Mock achievement check to isolate this unit
vi.mock("@/lib/achievements", () => ({
  checkAndAwardAchievements: vi.fn().mockResolvedValue(undefined),
}));

const { POST } = await import("../sessions/[id]/route");
import { checkAndAwardAchievements } from "@/lib/achievements";

import { makePostReq, makeParams } from "./helpers";

const SESSION_ID = "sess-1";

const makeSession = (overrides = {}) => ({
  id: SESSION_ID,
  status: "IN_PROGRESS",
  expenses: [],
  players: [],
  ...overrides,
});

const makeSessionPlayer = (userId: string, overrides = {}) => ({
  id: `sp-${userId}`,
  sessionId: SESSION_ID,
  userId,
  status: "CHECKED_IN",
  amountDue: 0,
  amountPaid: 0,
  ...overrides,
});

const makeUser = (id: string, overrides = {}) => ({
  id,
  rankPoints: 100,
  rankTier: "BRONZE",
  totalSessions: 5,
  totalWins: 3,
  totalLosses: 2,
  streak: 2,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.session.update.mockResolvedValue({ id: SESSION_ID, status: "COMPLETED" });
  prismaMock.user.update.mockResolvedValue({});
  prismaMock.rankHistory.create.mockResolvedValue({});
  prismaMock.sessionPlayer.update.mockResolvedValue({});
});

describe("POST /api/sessions/[id]?action=complete", () => {
  it("returns 400 for unknown action", async () => {
    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=unknown`, {}),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(400);
  });

  it("returns 404 when session not found", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(404);
  });

  it("marks session as COMPLETED", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    expect(prismaMock.session.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "COMPLETED" }),
      })
    );
  });

  it("calculates cost per person from total expenses", async () => {
    const session = makeSession({
      expenses: [
        { amount: 600 }, // court
        { amount: 150 }, // shuttlecock
      ],
      players: [
        makeSessionPlayer("user-1"),
        makeSessionPlayer("user-2"),
        makeSessionPlayer("user-3"),
      ],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1"))
      .mockResolvedValueOnce(makeUser("user-2"))
      .mockResolvedValueOnce(makeUser("user-3"));

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    // 750 / 3 = 250 per person (ceil)
    expect(prismaMock.session.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalCost: 750, costPerPerson: 250 }),
      })
    );
  });

  it("awards SESSION_JOIN points (10) to each active player", async () => {
    const session = makeSession({
      expenses: [],
      players: [makeSessionPlayer("user-1"), makeSessionPlayer("user-2")],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1", { rankPoints: 100, streak: 0 }))
      .mockResolvedValueOnce(makeUser("user-2", { rankPoints: 200, streak: 0 }));

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    // Both players should have +10 points
    expect(prismaMock.user.update).toHaveBeenCalledTimes(2);
    const firstUpdate = prismaMock.user.update.mock.calls[0][0];
    expect(firstUpdate.data.rankPoints).toBe(110); // 100 + 10
  });

  it("increments streak for each completing player", async () => {
    const session = makeSession({
      expenses: [],
      players: [makeSessionPlayer("user-1")],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1", { streak: 2 }));

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const updateArg = prismaMock.user.update.mock.calls[0][0];
    expect(updateArg.data.streak).toBe(3);
  });

  it("awards STREAK_BONUS_3 (20 pts) when streak reaches 3", async () => {
    const session = makeSession({
      expenses: [],
      players: [makeSessionPlayer("user-1")],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    // streak=2 → after session streak becomes 3 → bonus
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser("user-1", { rankPoints: 100, streak: 2 })
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    // Points: 100 + 10 (join) + 20 (streak bonus) = 130
    const updateArg = prismaMock.user.update.mock.calls[0][0];
    expect(updateArg.data.rankPoints).toBe(130);

    // Should create two rankHistory entries: join + streak bonus
    expect(prismaMock.rankHistory.create).toHaveBeenCalledTimes(2);
  });

  it("does NOT create streak history entry when no streak bonus", async () => {
    const session = makeSession({
      expenses: [],
      players: [makeSessionPlayer("user-1")],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    // streak=0 → becomes 1 → no bonus
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser("user-1", { rankPoints: 100, streak: 0 })
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    // Only 1 rankHistory: SESSION_JOIN (no streak bonus)
    expect(prismaMock.rankHistory.create).toHaveBeenCalledTimes(1);
    const histArg = prismaMock.rankHistory.create.mock.calls[0][0];
    expect(histArg.data.reason).toBe("SESSION_JOIN");
  });

  it("calls checkAndAwardAchievements for each player", async () => {
    const session = makeSession({
      expenses: [],
      players: [makeSessionPlayer("user-1"), makeSessionPlayer("user-2")],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1"))
      .mockResolvedValueOnce(makeUser("user-2"));

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    expect(checkAndAwardAchievements).toHaveBeenCalledTimes(2);
    expect(checkAndAwardAchievements).toHaveBeenCalledWith("user-1");
    expect(checkAndAwardAchievements).toHaveBeenCalledWith("user-2");
  });

  it("sets amountDue per player from cost split", async () => {
    const session = makeSession({
      expenses: [{ amount: 300 }],
      players: [makeSessionPlayer("user-1"), makeSessionPlayer("user-2")],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1"))
      .mockResolvedValueOnce(makeUser("user-2"));

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    // 300 / 2 = 150 per person
    expect(prismaMock.sessionPlayer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { amountDue: 150 },
      })
    );
  });

  it("skips null-userId (guest) players when splitting costs", async () => {
    const session = makeSession({
      expenses: [{ amount: 200 }],
      players: [
        makeSessionPlayer("user-1"),
        { ...makeSessionPlayer("guest-1"), userId: null }, // guest — skipped
      ],
    });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1"));

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    // Only 1 active player — amountDue = 200
    const sessionUpdate = prismaMock.session.update.mock.calls[0][0];
    expect(sessionUpdate.data.costPerPerson).toBe(200);
  });
});
