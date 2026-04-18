import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { POST } = await import("../sessions/[id]/queue/call/route");

import { makePostReq, makeParams } from "./helpers";

const SESSION_ID = "sess-1";

const makeQueueEntry = (userId: string, position: number, overrides = {}) => ({
  id: `qe-${userId}`,
  sessionId: SESSION_ID,
  userId,
  position,
  status: "WAITING",
  joinedAt: new Date(),
  calledAt: null,
  waitDurationSeconds: 0,
  user: { id: userId, name: `Player ${userId}`, avatarUrl: null, rankTier: "BRONZE" },
  ...overrides,
});

const makeSession = (overrides = {}) => ({
  id: SESSION_ID,
  status: "IN_PROGRESS",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.queueEntry.update.mockResolvedValue({});
  prismaMock.sessionPlayer.updateMany.mockResolvedValue({});
});

describe("POST /api/sessions/[id]/queue/call", () => {
  it("returns 404 when session not found", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 4 }),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/not found/i);
  });

  it("returns 400 when count is missing or zero", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, {}),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when count is negative", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: -1 }),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when not enough waiting players", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.queueEntry.findMany.mockResolvedValue([
      makeQueueEntry("user-1", 1),
      makeQueueEntry("user-2", 2),
    ]);

    // Asking for 4 but only 2 waiting
    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 4 }),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/not enough/i);
    expect(data.available).toBe(2);
    expect(data.requested).toBe(4);
  });

  it("calls exactly `count` players from the front of the queue", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    const entries = [
      makeQueueEntry("user-1", 1),
      makeQueueEntry("user-2", 2),
      makeQueueEntry("user-3", 3),
      makeQueueEntry("user-4", 4),
      makeQueueEntry("user-5", 5),
    ];
    prismaMock.queueEntry.findMany.mockResolvedValue(entries);

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 4 }),
      makeParams(SESSION_ID)
    );

    expect(res.status).toBe(200);
    // Should update only the first 4 entries
    expect(prismaMock.queueEntry.update).toHaveBeenCalledTimes(4);
  });

  it("marks called entries with status CALLED and sets calledAt", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.queueEntry.findMany.mockResolvedValue([
      makeQueueEntry("user-1", 1),
      makeQueueEntry("user-2", 2),
    ]);

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 2 }),
      makeParams(SESSION_ID)
    );

    const firstUpdate = prismaMock.queueEntry.update.mock.calls[0][0];
    expect(firstUpdate.data.status).toBe("CALLED");
    expect(firstUpdate.data.calledAt).toBeInstanceOf(Date);
  });

  it("updates sessionPlayer status to PLAYING for called users", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.queueEntry.findMany.mockResolvedValue([
      makeQueueEntry("user-1", 1),
      makeQueueEntry("user-2", 2),
    ]);

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 2 }),
      makeParams(SESSION_ID)
    );

    expect(prismaMock.sessionPlayer.updateMany).toHaveBeenCalledTimes(2);
    const firstSPUpdate = prismaMock.sessionPlayer.updateMany.mock.calls[0][0];
    expect(firstSPUpdate.data.status).toBe("PLAYING");
    expect(firstSPUpdate.where.sessionId).toBe(SESSION_ID);
    expect(firstSPUpdate.where.userId).toBe("user-1");
  });

  it("returns the called entries in the response body", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    const entries = [
      makeQueueEntry("user-1", 1),
      makeQueueEntry("user-2", 2),
    ];
    prismaMock.queueEntry.findMany.mockResolvedValue(entries);

    const res = await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 2 }),
      makeParams(SESSION_ID)
    );

    const data = await res.json();
    expect(data.called).toHaveLength(2);
    expect(data.called[0].userId).toBe("user-1");
    expect(data.called[1].userId).toBe("user-2");
  });

  it("records waitDurationSeconds for each called entry", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    const joinedAt = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    prismaMock.queueEntry.findMany.mockResolvedValue([
      makeQueueEntry("user-1", 1, { joinedAt }),
    ]);

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 1 }),
      makeParams(SESSION_ID)
    );

    const updateArg = prismaMock.queueEntry.update.mock.calls[0][0];
    expect(updateArg.data.waitDurationSeconds).toBeGreaterThanOrEqual(5 * 60 - 1);
    expect(updateArg.data.waitDurationSeconds).toBeLessThanOrEqual(5 * 60 + 5);
  });

  it("fetches queue sorted by position ascending (FIFO order)", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.queueEntry.findMany.mockResolvedValue([]);

    await POST(
      makePostReq(`/api/sessions/${SESSION_ID}/queue/call`, { count: 4 }),
      makeParams(SESSION_ID)
    ).catch(() => {}); // may 400 due to empty queue, just verify the query

    expect(prismaMock.queueEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sessionId: SESSION_ID,
          status: "WAITING",
        }),
        orderBy: { position: "asc" },
      })
    );
  });
});
