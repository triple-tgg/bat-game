import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rankings - Get leaderboard
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  const players = await prisma.user.findMany({
    where: { role: { not: "GUEST" } },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      rankPoints: true,
      rankTier: true,
      totalWins: true,
      totalLosses: true,
      totalSessions: true,
      streak: true,
    },
    orderBy: { rankPoints: "desc" },
    take: limit,
  });

  const rankings = players.map((player, index) => ({
    rank: index + 1,
    ...player,
    winRate:
      player.totalWins + player.totalLosses > 0
        ? Math.round(
            (player.totalWins / (player.totalWins + player.totalLosses)) * 100
          )
        : 0,
  }));

  return NextResponse.json(rankings);
}
