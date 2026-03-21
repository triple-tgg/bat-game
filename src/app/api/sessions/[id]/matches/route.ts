import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RANK_POINTS, calculateRankTier, getStreakBonus } from "@/lib/ranking";

// GET /api/sessions/[id]/matches - List matches for a session
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const matches = await prisma.match.findMany({
    where: { sessionId: params.id },
    include: {
      players: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, rankTier: true } },
        },
      },
    },
    orderBy: [{ roundNumber: "desc" }, { courtNumber: "asc" }],
  });

  return NextResponse.json(matches);
}

// PUT /api/sessions/[id]/matches - Update match result
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { matchId, team1Score, team2Score } = body;

  if (!matchId || team1Score === undefined || team2Score === undefined) {
    return NextResponse.json(
      { error: "matchId, team1Score, and team2Score are required" },
      { status: 400 }
    );
  }

  const winningTeam = team1Score > team2Score ? 1 : 2;

  // Update match
  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      team1Score,
      team2Score,
      status: "COMPLETED",
      endTime: new Date(),
    },
    include: { players: true },
  });

  // Update match players and rank points
  for (const player of match.players) {
    const isWinner = player.team === winningTeam;
    const points = isWinner ? RANK_POINTS.MATCH_WIN : RANK_POINTS.MATCH_LOSS;

    // Update match player
    await prisma.matchPlayer.update({
      where: { id: player.id },
      data: { isWinner },
    });

    // Update user stats and rank
    const user = await prisma.user.findUnique({ where: { id: player.userId } });
    if (user) {
      const newPoints = user.rankPoints + points;
      await prisma.user.update({
        where: { id: player.userId },
        data: {
          rankPoints: newPoints,
          rankTier: calculateRankTier(newPoints),
          totalWins: isWinner ? user.totalWins + 1 : user.totalWins,
          totalLosses: isWinner ? user.totalLosses : user.totalLosses + 1,
        },
      });

      // Record rank history
      await prisma.rankHistory.create({
        data: {
          userId: player.userId,
          points,
          reason: isWinner ? "MATCH_WIN" : "MATCH_LOSS",
          sessionId: match.sessionId,
        },
      });
    }

    // Return players to queue
    await prisma.queueEntry.updateMany({
      where: {
        sessionId: match.sessionId,
        userId: player.userId,
        status: "PLAYING",
      },
      data: { status: "DONE" },
    });

    // Create new queue entry (back of the line)
    const lastInQueue = await prisma.queueEntry.findFirst({
      where: { sessionId: match.sessionId },
      orderBy: { position: "desc" },
    });

    await prisma.queueEntry.create({
      data: {
        sessionId: match.sessionId,
        userId: player.userId,
        position: (lastInQueue?.position || 0) + 1,
        status: "WAITING",
      },
    });

    // Update session player rounds
    await prisma.sessionPlayer.updateMany({
      where: {
        sessionId: match.sessionId,
        userId: player.userId,
      },
      data: {
        status: "WAITING",
        roundsPlayed: { increment: 1 },
      },
    });
  }

  return NextResponse.json(match);
}
