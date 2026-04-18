import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/achievements", () => ({
  checkAndAwardAchievements: vi.fn().mockResolvedValue(undefined),
}));

const { POST } = await import("../sessions/[id]/route");

import { makePostReq, makeParams } from "./helpers";

const SESSION_ID = "sess-recurring";

// A Monday session at 09:00–11:00
const sessionDate = new Date("2025-01-06T09:00:00");  // Monday
const startTime  = new Date("2025-01-06T09:00:00");
const endTime    = new Date("2025-01-06T11:00:00");

const makeRecurringSession = (rule: string, overrides = {}) => ({
  id: SESSION_ID,
  title: "Weekly Badminton",
  status: "IN_PROGRESS",
  date: sessionDate,
  startTime,
  endTime,
  venueId: "venue-1",
  clubId: "club-1",
  maxPlayers: 12,
  notes: "Regular game",
  isRecurring: true,
  recurringRule: rule,
  expenses: [],
  players: [],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.session.update.mockResolvedValue({
    id: SESSION_ID,
    status: "COMPLETED",
  });
  prismaMock.session.create.mockResolvedValue({
    id: "sess-next",
    status: "OPEN",
  });
  prismaMock.user.update.mockResolvedValue({});
  prismaMock.rankHistory.create.mockResolvedValue({});
  prismaMock.sessionPlayer.update.mockResolvedValue({});
});

describe("POST /api/sessions/[id]?action=complete — recurring sessions", () => {
  it("does NOT create a next session for non-recurring sessions", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      ...makeRecurringSession("WEEKLY:MON"),
      isRecurring: false,
      recurringRule: null,
    });

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("creates next session when isRecurring=true with WEEKLY rule", async () => {
    // Monday session with MON,WED rule → next is Wednesday 2025-01-08
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:MON,WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
  });

  it("sets next session date to the correct next occurrence (WEEKLY)", async () => {
    // Monday + WEEKLY:MON,WED → next is Wednesday 2025-01-08
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:MON,WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    const nextDate: Date = createArg.data.date;
    expect(nextDate.getDay()).toBe(3); // Wednesday
    expect(nextDate.getDate()).toBe(8);
  });

  it("sets next session date to the correct next occurrence (MONTHLY)", async () => {
    // Jan 6 + MONTHLY:1,15 → next is Jan 15
    const jan6Session = {
      ...makeRecurringSession("MONTHLY:1,15"),
      date: new Date("2025-01-06T09:00:00"),
      startTime: new Date("2025-01-06T09:00:00"),
      endTime: new Date("2025-01-06T11:00:00"),
    };
    prismaMock.session.findUnique.mockResolvedValue(jan6Session);

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    const nextDate: Date = createArg.data.date;
    expect(nextDate.getDate()).toBe(15);
    expect(nextDate.getMonth()).toBe(0); // still January
  });

  it("preserves startTime and endTime duration in next session", async () => {
    // Original: 09:00–11:00 (2h duration)
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:MON,WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    const nextStart: Date = createArg.data.startTime;
    const nextEnd: Date = createArg.data.endTime;

    expect(nextStart.getHours()).toBe(9);
    expect(nextStart.getMinutes()).toBe(0);
    expect(nextEnd.getHours()).toBe(11);
    expect(nextEnd.getMinutes()).toBe(0);
  });

  it("copies session settings (title, venueId, clubId, maxPlayers, notes)", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    expect(createArg.data.title).toBe("Weekly Badminton");
    expect(createArg.data.venueId).toBe("venue-1");
    expect(createArg.data.clubId).toBe("club-1");
    expect(createArg.data.maxPlayers).toBe(12);
    expect(createArg.data.notes).toBe("Regular game");
  });

  it("sets next session status to OPEN", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    expect(createArg.data.status).toBe("OPEN");
  });

  it("propagates isRecurring and recurringRule to next session", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:MON,WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    expect(createArg.data.isRecurring).toBe(true);
    expect(createArg.data.recurringRule).toBe("WEEKLY:MON,WED");
  });

  it("generates a unique shareToken for the next session", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:WED")
    );

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const createArg = prismaMock.session.create.mock.calls[0][0];
    expect(createArg.data.shareToken).toBeDefined();
    expect(typeof createArg.data.shareToken).toBe("string");
    expect(createArg.data.shareToken.length).toBe(8);
  });

  it("includes nextSession in the response", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:WED")
    );

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}?action=complete`, {}),
      makeParams(SESSION_ID)
    );

    const data = await res.json();
    expect(data.nextSession).toBeDefined();
    expect(data.nextSession.id).toBe("sess-next");
  });

  it("still completes current session even when recurring", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeRecurringSession("WEEKLY:WED")
    );

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
});
