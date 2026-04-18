import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";
import { RANK_POINTS } from "@/lib/ranking";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { PUT } = await import("../sessions/[id]/matches/route");

import { makePutReq } from "./helpers";

const MATCH_ID = "match-1";
const SESSION_ID = "sess-1";

const makeMatch = (overrides = {}) => ({
  id: MATCH_ID,
  sessionId: SESSION_ID,
  team1Score: 21,
  team2Score: 15,
  status: "COMPLETED",
  endTime: new Date(),
  players: [
    { id: "mp-1", matchId: MATCH_ID, userId: "user-1", team: 1, isWinner: true },
    { id: "mp-2", matchId: MATCH_ID, userId: "user-2", team: 1, isWinner: true },
    { id: "mp-3", matchId: MATCH_ID, userId: "user-3", team: 2, isWinner: false },
    { id: "mp-4", matchId: MATCH_ID, userId: "user-4", team: 2, isWinner: false },
  ],
  ...overrides,
});

const makeUser = (id: string, overrides = {}) => ({
  id,
  rankPoints: 200,
  totalWins: 5,
  totalLosses: 3,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.matchPlayer.update.mockResolvedValue({});
  prismaMock.rankHistory.create.mockResolvedValue({});
  prismaMock.queueEntry.updateMany.mockResolvedValue({});
  prismaMock.queueEntry.findFirst.mockResolvedValue(null);
  prismaMock.queueEntry.create.mockResolvedValue({});
  prismaMock.sessionPlayer.updateMany.mockResolvedValue({});
});

describe("PUT /api/sessions/[id]/matches", () => {
  it("returns 400 when matchId is missing", async () => {
    const res = await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        team1Score: 21,
        team2Score: 15,
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when team1Score is missing", async () => {
    const res = await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team2Score: 15,
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when team2Score is missing", async () => {
    const res = await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
      })
    );

    expect(res.status).toBe(400);
  });

  it("marks match as COMPLETED with correct scores", async () => {
    const match = makeMatch();
    prismaMock.match.update.mockResolvedValue(match);
    prismaMock.user.findUnique
      .mockResolvedValue(makeUser("user-1"))
      .mockResolvedValue(makeUser("user-2"))
      .mockResolvedValue(makeUser("user-3"))
      .mockResolvedValue(makeUser("user-4"));
    prismaMock.user.update.mockResolvedValue({});

    const res = await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    expect(res.status).toBe(200);
    expect(prismaMock.match.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MATCH_ID },
        data: expect.objectContaining({
          team1Score: 21,
          team2Score: 15,
          status: "COMPLETED",
        }),
      })
    );
  });

  it("awards MATCH_WIN points to winning team players", async () => {
    // Team 1 wins (21-15)
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1", { rankPoints: 200 }));
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    // First player call (team1 winner)
    const firstUserUpdate = prismaMock.user.update.mock.calls[0][0];
    expect(firstUserUpdate.data.rankPoints).toBe(200 + RANK_POINTS.MATCH_WIN);
    expect(firstUserUpdate.data.totalWins).toBe(6); // +1 from makeUser's totalWins=5
  });

  it("awards MATCH_LOSS points to losing team players", async () => {
    // Team 2 loses — players at index 2,3 in match.players are team2
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1", { rankPoints: 200 })) // winner
      .mockResolvedValueOnce(makeUser("user-2", { rankPoints: 200 })) // winner
      .mockResolvedValueOnce(makeUser("user-3", { rankPoints: 150 })) // loser
      .mockResolvedValueOnce(makeUser("user-4", { rankPoints: 150 })); // loser
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    // Third update call is for user-3 (loser)
    const loserUpdate = prismaMock.user.update.mock.calls[2][0];
    expect(loserUpdate.data.rankPoints).toBe(150 + RANK_POINTS.MATCH_LOSS);
    expect(loserUpdate.data.totalLosses).toBe(4); // +1 from makeUser's totalLosses=3
  });

  it("records MATCH_WIN rank history for winners", async () => {
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1"));
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    const winHistory = prismaMock.rankHistory.create.mock.calls.find(
      (c) => c[0].data.reason === "MATCH_WIN"
    );
    expect(winHistory).toBeDefined();
    expect(winHistory![0].data.sessionId).toBe(SESSION_ID);
  });

  it("records MATCH_LOSS rank history for losers", async () => {
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1"))
      .mockResolvedValueOnce(makeUser("user-2"))
      .mockResolvedValueOnce(makeUser("user-3"))
      .mockResolvedValueOnce(makeUser("user-4"));
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    const lossHistory = prismaMock.rankHistory.create.mock.calls.find(
      (c) => c[0].data.reason === "MATCH_LOSS"
    );
    expect(lossHistory).toBeDefined();
  });

  it("returns players to queue with DONE status after match", async () => {
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1"));
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    expect(prismaMock.queueEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "PLAYING" }),
        data: { status: "DONE" },
      })
    );
  });

  it("re-queues each player at end of queue after match", async () => {
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1"));
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.queueEntry.findFirst.mockResolvedValue({ position: 5 });

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    expect(prismaMock.queueEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "WAITING" }),
      })
    );
  });

  it("increments roundsPlayed for each player", async () => {
    prismaMock.match.update.mockResolvedValue(makeMatch());
    prismaMock.user.findUnique.mockResolvedValue(makeUser("user-1"));
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 21,
        team2Score: 15,
      })
    );

    expect(prismaMock.sessionPlayer.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          roundsPlayed: { increment: 1 },
        }),
      })
    );
  });

  it("correctly identifies winning team when team2 wins", async () => {
    // Team 2 wins (15-21 reversed)
    const matchWithTeam2Win = makeMatch({
      team1Score: 15,
      team2Score: 21,
      players: [
        { id: "mp-1", matchId: MATCH_ID, userId: "user-1", team: 1, isWinner: false },
        { id: "mp-3", matchId: MATCH_ID, userId: "user-3", team: 2, isWinner: true },
      ],
    });
    prismaMock.match.update.mockResolvedValue(matchWithTeam2Win);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(makeUser("user-1", { rankPoints: 200 }))
      .mockResolvedValueOnce(makeUser("user-3", { rankPoints: 200 }));
    prismaMock.user.update.mockResolvedValue({});

    await PUT(
      makePutReq("/api/sessions/sess-1/matches", {
        matchId: MATCH_ID,
        team1Score: 15,
        team2Score: 21,
      })
    );

    // First update = user-1 (team1, loser)
    const loserUpdate = prismaMock.user.update.mock.calls[0][0];
    expect(loserUpdate.data.rankPoints).toBe(200 + RANK_POINTS.MATCH_LOSS);
    expect(loserUpdate.data.totalLosses).toBe(4);

    // Second update = user-3 (team2, winner)
    const winnerUpdate = prismaMock.user.update.mock.calls[1][0];
    expect(winnerUpdate.data.rankPoints).toBe(200 + RANK_POINTS.MATCH_WIN);
    expect(winnerUpdate.data.totalWins).toBe(6);
  });
});
