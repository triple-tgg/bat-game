import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomMatchmaking, skillBasedMatchmaking } from "@/lib/matchmaking";

// POST /api/sessions/[id]/matchmake - Auto matchmaking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { strategy = "random", matchType = "DOUBLES" } = body;

  const session = await prisma.session.findUnique({
    where: { id: id },
    include: { venue: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get players in queue
  const queueEntries = await prisma.queueEntry.findMany({
    where: { sessionId: id, status: "WAITING" },
    include: {
      user: { select: { id: true, name: true, rankPoints: true } },
    },
    orderBy: { position: "asc" },
  });

  const players = queueEntries.map((e) => e.user);
  const courtsAvailable = session.venue.courtsCount;

  const matchFn = strategy === "skill" ? skillBasedMatchmaking : randomMatchmaking;
  const pairings = matchFn(players, courtsAvailable, matchType);

  if (pairings.length === 0) {
    return NextResponse.json(
      { error: "Not enough players for matchmaking" },
      { status: 400 }
    );
  }

  // Get current round number
  const lastMatch = await prisma.match.findFirst({
    where: { sessionId: id },
    orderBy: { roundNumber: "desc" },
  });
  const roundNumber = (lastMatch?.roundNumber || 0) + 1;

  // Create matches
  const createdMatches = [];
  for (const pairing of pairings) {
    const match = await prisma.match.create({
      data: {
        sessionId: id,
        courtNumber: pairing.courtNumber,
        matchType,
        roundNumber,
        status: "IN_PROGRESS",
        startTime: new Date(),
        players: {
          create: [
            ...pairing.team1.map((p) => ({ userId: p.id, team: 1 })),
            ...pairing.team2.map((p) => ({ userId: p.id, team: 2 })),
          ],
        },
      },
      include: { players: { include: { user: true } } },
    });
    createdMatches.push(match);

    // Update queue status
    const playerIds = [...pairing.team1, ...pairing.team2].map((p) => p.id);
    await prisma.queueEntry.updateMany({
      where: {
        sessionId: id,
        userId: { in: playerIds },
      },
      data: { status: "PLAYING", calledAt: new Date() },
    });

    // Update session player status
    await prisma.sessionPlayer.updateMany({
      where: {
        sessionId: id,
        userId: { in: playerIds },
      },
      data: { status: "PLAYING" },
    });
  }

  return NextResponse.json({
    roundNumber,
    matches: createdMatches,
    remainingInQueue: queueEntries.length - pairings.length * (matchType === "DOUBLES" ? 4 : 2),
  });
}
