import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RANK_POINTS, calculateRankTier, getStreakBonus } from "@/lib/ranking";
import { checkAndAwardAchievements } from "@/lib/achievements";

// GET /api/sessions/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      venue: { include: { courts: true } },
      club: true,
      players: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, rankTier: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      matches: {
        include: {
          players: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: [{ roundNumber: "desc" }, { courtNumber: "asc" }],
      },
      expenses: { orderBy: { createdAt: "desc" } },
      _count: { select: { players: true, matches: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

// PATCH /api/sessions/[id] — update session (status, shuttlecock count, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const session = await prisma.session.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(session);
}

// DELETE /api/sessions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.session.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}

// POST /api/sessions/[id]?action=complete — complete session & award rank points
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action !== "complete") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      players: { where: { status: { not: "LEFT" } } },
      expenses: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Calculate final cost per person
  const totalCost = session.expenses.reduce((s, e) => s + e.amount, 0);
  const activePlayers = session.players.filter((p) => p.userId !== null);
  const perPerson =
    activePlayers.length > 0 ? Math.ceil(totalCost / activePlayers.length) : 0;

  // Award session participation points and update streaks
  for (const sp of activePlayers) {
    if (!sp.userId) continue;

    const user = await prisma.user.findUnique({ where: { id: sp.userId } });
    if (!user) continue;

    const newStreak = user.streak + 1;
    const streakBonus = getStreakBonus(newStreak);
    const joinPoints = RANK_POINTS.SESSION_JOIN;
    const totalPoints = joinPoints + streakBonus;
    const newRankPoints = user.rankPoints + totalPoints;

    await prisma.user.update({
      where: { id: sp.userId },
      data: {
        rankPoints: newRankPoints,
        rankTier: calculateRankTier(newRankPoints),
        totalSessions: user.totalSessions + 1,
        streak: newStreak,
      },
    });

    await prisma.rankHistory.create({
      data: {
        userId: sp.userId,
        points: joinPoints,
        reason: "SESSION_JOIN",
        sessionId: session.id,
      },
    });

    if (streakBonus > 0) {
      await prisma.rankHistory.create({
        data: {
          userId: sp.userId,
          points: streakBonus,
          reason: `STREAK_BONUS_${newStreak}`,
          sessionId: session.id,
        },
      });
    }

    // Set amount due
    await prisma.sessionPlayer.update({
      where: { id: sp.id },
      data: { amountDue: perPerson },
    });

    // Check achievements
    await checkAndAwardAchievements(sp.userId);
  }

  // Mark session complete
  const completed = await prisma.session.update({
    where: { id: params.id },
    data: {
      status: "COMPLETED",
      totalCost,
      costPerPerson: perPerson,
    },
  });

  return NextResponse.json(completed);
}
