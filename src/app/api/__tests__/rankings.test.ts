import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { GET } = await import("../rankings/route");

import { makeGetReq } from "./helpers";

const makePlayer = (overrides = {}) => ({
  id: "p1",
  name: "Player",
  avatarUrl: null,
  rankPoints: 100,
  rankTier: "BRONZE",
  totalWins: 5,
  totalLosses: 3,
  totalSessions: 8,
  streak: 2,
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("GET /api/rankings", () => {
  it("returns players ordered by rankPoints descending with rank numbers", async () => {
    const players = [
      makePlayer({ id: "p1", rankPoints: 500, totalWins: 20, totalLosses: 5 }),
      makePlayer({ id: "p2", rankPoints: 200, totalWins: 10, totalLosses: 5 }),
    ];
    prismaMock.user.findMany.mockResolvedValue(players);

    const res = await GET(makeGetReq("/api/rankings"));
    const data = await res.json();

    expect(data).toHaveLength(2);
    expect(data[0].rank).toBe(1);
    expect(data[0].id).toBe("p1");
    expect(data[1].rank).toBe(2);
    expect(data[1].id).toBe("p2");
  });

  it("calculates winRate correctly", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      makePlayer({ totalWins: 3, totalLosses: 1 }), // 75%
    ]);

    const res = await GET(makeGetReq("/api/rankings"));
    const [player] = await res.json();

    expect(player.winRate).toBe(75);
  });

  it("returns winRate of 0 when player has no games", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      makePlayer({ totalWins: 0, totalLosses: 0 }),
    ]);

    const res = await GET(makeGetReq("/api/rankings"));
    const [player] = await res.json();

    expect(player.winRate).toBe(0);
  });

  it("defaults to top 10 limit", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/rankings"));

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    );
  });

  it("respects custom limit query param", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/rankings?limit=5"));

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it("filters out GUEST users", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/rankings"));

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: { not: "GUEST" } },
      })
    );
  });

  it("returns empty array when no players", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const res = await GET(makeGetReq("/api/rankings"));
    const data = await res.json();

    expect(data).toEqual([]);
    expect(res.status).toBe(200);
  });
});
