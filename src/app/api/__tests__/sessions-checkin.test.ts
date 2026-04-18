import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { POST } = await import("../sessions/[id]/checkin/route");

import { makePostReq, makeParams } from "./helpers";

const makeSessionPlayer = (overrides = {}) => ({
  id: "sp-1",
  sessionId: "sess-1",
  userId: "user-1",
  status: "REGISTERED",
  checkinAt: null,
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("POST /api/sessions/[id]/checkin", () => {
  it("checks in a REGISTERED player and returns updated record", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(makeSessionPlayer());
    prismaMock.sessionPlayer.update.mockResolvedValue(
      makeSessionPlayer({ status: "CHECKED_IN", checkinAt: new Date() })
    );
    prismaMock.queueEntry.findFirst.mockResolvedValue(null);
    prismaMock.queueEntry.create.mockResolvedValue({});

    const res = await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(200);
    expect(prismaMock.sessionPlayer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "CHECKED_IN" }),
      })
    );
  });

  it("sets checkinAt timestamp", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(makeSessionPlayer());
    prismaMock.sessionPlayer.update.mockResolvedValue(
      makeSessionPlayer({ status: "CHECKED_IN" })
    );
    prismaMock.queueEntry.findFirst.mockResolvedValue(null);
    prismaMock.queueEntry.create.mockResolvedValue({});

    await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "user-1" }),
      makeParams("sess-1")
    );

    const updateArg = prismaMock.sessionPlayer.update.mock.calls[0][0];
    expect(updateArg.data.checkinAt).toBeInstanceOf(Date);
  });

  it("adds player to queue as WAITING at position after last entry", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(makeSessionPlayer());
    prismaMock.sessionPlayer.update.mockResolvedValue(
      makeSessionPlayer({ status: "CHECKED_IN" })
    );
    prismaMock.queueEntry.findFirst.mockResolvedValue({ position: 3 });
    prismaMock.queueEntry.create.mockResolvedValue({});

    await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(prismaMock.queueEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionId: "sess-1",
          userId: "user-1",
          position: 4,
          status: "WAITING",
        }),
      })
    );
  });

  it("adds at position 1 when queue is empty", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(makeSessionPlayer());
    prismaMock.sessionPlayer.update.mockResolvedValue(
      makeSessionPlayer({ status: "CHECKED_IN" })
    );
    prismaMock.queueEntry.findFirst.mockResolvedValue(null);
    prismaMock.queueEntry.create.mockResolvedValue({});

    await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(prismaMock.queueEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 1 }),
      })
    );
  });

  it("returns 400 when userId is missing", async () => {
    const res = await POST(
      makePostReq("/api/sessions/sess-1/checkin", {}),
      makeParams("sess-1")
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/userId/i);
  });

  it("returns 404 when player not found in session", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);

    const res = await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "unknown" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 when player is already CHECKED_IN", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(
      makeSessionPlayer({ status: "CHECKED_IN" })
    );

    const res = await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/already/i);
  });

  it("returns 400 when player is already PLAYING", async () => {
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(
      makeSessionPlayer({ status: "PLAYING" })
    );

    const res = await POST(
      makePostReq("/api/sessions/sess-1/checkin", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(400);
  });
});
