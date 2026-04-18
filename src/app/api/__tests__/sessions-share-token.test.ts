import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { GET } = await import("../sessions/share/[token]/route");

import { makeGetReq } from "./helpers";

const makeTokenParams = (token: string) => ({
  params: Promise.resolve({ token }),
});

const makeSession = (overrides = {}) => ({
  id: "sess-1",
  title: "แบดมินตันวันอังคาร",
  date: new Date("2025-01-07T18:00:00"),
  startTime: new Date("2025-01-07T18:00:00"),
  endTime: new Date("2025-01-07T21:00:00"),
  maxPlayers: 12,
  status: "OPEN",
  shareToken: "ABC12345",
  notes: "สนาม A",
  venue: { id: "venue-1", name: "สนามบีเอส" },
  _count: { players: 8 },
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("GET /api/sessions/share/[token]", () => {
  it("returns session data for a valid token", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("sess-1");
    expect(data.title).toBe("แบดมินตันวันอังคาร");
  });

  it("queries by shareToken field", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());

    await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { shareToken: "ABC12345" },
      })
    );
  });

  it("includes venue name in response", async () => {
    prismaMock.session.findUnique.mockResolvedValue(makeSession());

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    const data = await res.json();
    expect(data.venue.name).toBe("สนามบีเอส");
  });

  it("includes player count in response", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ _count: { players: 8 } })
    );

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    const data = await res.json();
    expect(data._count.players).toBe(8);
  });

  it("returns isFull=true when player count equals maxPlayers", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ maxPlayers: 12, _count: { players: 12 } })
    );

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    const data = await res.json();
    expect(data.isFull).toBe(true);
  });

  it("returns isFull=false when spots are available", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ maxPlayers: 12, _count: { players: 8 } })
    );

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    const data = await res.json();
    expect(data.isFull).toBe(false);
    expect(data.spotsLeft).toBe(4);
  });

  it("returns 404 for an invalid token", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const res = await GET(makeGetReq("/api/sessions/share/BADTOKEN"), makeTokenParams("BADTOKEN"));

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 410 GONE when session is CANCELLED", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ status: "CANCELLED" })
    );

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    expect(res.status).toBe(410);
  });

  it("returns 410 GONE when session is COMPLETED", async () => {
    prismaMock.session.findUnique.mockResolvedValue(
      makeSession({ status: "COMPLETED" })
    );

    const res = await GET(makeGetReq("/api/sessions/share/ABC12345"), makeTokenParams("ABC12345"));

    expect(res.status).toBe(410);
  });
});
