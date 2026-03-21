import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/players/[id]/stats - Get player statistics
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
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
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // Recent matches
  const recentMatches = await prisma.matchPlayer.findMany({
    where: { userId: params.id },
    include: {
      match: {
        include: {
          players: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          session: { select: { title: true, date: true } },
        },
      },
    },
    orderBy: { match: { createdAt: "desc" } },
    take: 20,
  });

  // Rank history
  const rankHistory = await prisma.rankHistory.findMany({
    where: { userId: params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Achievements
  const achievements = await prisma.userAchievement.findMany({
    where: { userId: params.id },
    include: { achievement: true },
    orderBy: { earnedAt: "desc" },
  });

  // Best partners (most wins together)
  const partnerStats = await prisma.$queryRaw`
    SELECT
      mp2."userId" as "partnerId",
      u.name as "partnerName",
      COUNT(*) FILTER (WHERE mp1."isWinner" = true) as wins,
      COUNT(*) as "totalGames"
    FROM match_players mp1
    JOIN match_players mp2 ON mp1."matchId" = mp2."matchId" AND mp1.team = mp2.team AND mp1."userId" != mp2."userId"
    JOIN users u ON mp2."userId" = u.id
    WHERE mp1."userId" = ${params.id}
    GROUP BY mp2."userId", u.name
    ORDER BY wins DESC
    LIMIT 5
  `;

  return NextResponse.json({
    player: user,
    winRate:
      user.totalWins + user.totalLosses > 0
        ? Math.round(
            (user.totalWins / (user.totalWins + user.totalLosses)) * 100
          )
        : 0,
    recentMatches,
    rankHistory,
    achievements,
    bestPartners: partnerStats,
  });
}
