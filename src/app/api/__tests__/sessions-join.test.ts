import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { POST } = await import("../sessions/[id]/join/route");

import { makePostReq, makeParams } from "./helpers";

const makeSession = (overrides = {}) => ({
  id: "sess-1",
  status: "OPEN",
  maxPlayers: 10,
  _count: { players: 5 },
  ...overrides,
});

const makeSessionPlayer = (overrides = {}) => ({
  id: "sp-1",
  sessionId: "sess-1",
  userId: "user-1",
  status: "REGISTERED",
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("POST /api/sessions/[id]/join", () => {
  it("allows a registered user to join an OPEN session", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);
    prismaMock.sessionPlayer.create.mockResolvedValue(makeSessionPlayer());

    const res = await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.sessionId).toBe("sess-1");
  });

  it("allows a guest to join with guestName", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.sessionPlayer.create.mockResolvedValue(
      makeSessionPlayer({ userId: null, guestName: "สมชาย" })
    );

    const res = await POST(
      makePostReq("/api/sessions/sess-1/join", { guestName: "สมชาย", guestPhone: "0812345678" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(201);
    expect(prismaMock.sessionPlayer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ guestName: "สมชาย", userId: null }),
      })
    );
  });

  it("returns 404 when session does not exist", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const res = await POST(
      makePostReq("/api/sessions/bad-id/join", { userId: "user-1" }),
      makeParams("bad-id")
    );

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/not found/i);
  });

  it("returns 400 when session is DRAFT", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession({ status: "DRAFT" }));

    const res = await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 when session is COMPLETED", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession({ status: "COMPLETED" }));

    const res = await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when user already joined", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(makeSessionPlayer());

    const res = await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/already/i);
  });

  it("marks session as FULL when last slot is taken", async () => {
    // 9 of 10 players already joined — this join fills it
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ maxPlayers: 10, _count: { players: 9 } })
    );
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);
    prismaMock.sessionPlayer.create.mockResolvedValue(makeSessionPlayer());
    prismaMock.session.update.mockResolvedValue({});

    await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(prismaMock.session.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "FULL" },
      })
    );
  });

  it("does NOT update status to FULL when there are remaining slots", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ maxPlayers: 10, _count: { players: 5 } })
    );
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);
    prismaMock.sessionPlayer.create.mockResolvedValue(makeSessionPlayer());

    await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(prismaMock.session.update).not.toHaveBeenCalled();
  });

  it("sets WAITING status when session is already FULL", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ status: "FULL", maxPlayers: 10, _count: { players: 10 } })
    );
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);
    prismaMock.sessionPlayer.create.mockResolvedValue(
      makeSessionPlayer({ status: "WAITING" })
    );

    const res = await POST(
      makePostReq("/api/sessions/sess-1/join", { userId: "user-1" }),
      makeParams("sess-1")
    );

    expect(res.status).toBe(201);
    expect(prismaMock.sessionPlayer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "WAITING" }),
      })
    );
  });
});
