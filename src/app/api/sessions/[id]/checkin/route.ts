import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/checkin - Check in a player
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const player = await prisma.sessionPlayer.findFirst({
    where: { sessionId: params.id, userId },
  });

  if (!player) {
    return NextResponse.json(
      { error: "Player not found in this session" },
      { status: 404 }
    );
  }

  if (player.status === "CHECKED_IN" || player.status === "PLAYING") {
    return NextResponse.json(
      { error: "Already checked in" },
      { status: 400 }
    );
  }

  // Update player status and check-in time
  const updated = await prisma.sessionPlayer.update({
    where: { id: player.id },
    data: {
      status: "CHECKED_IN",
      checkinAt: new Date(),
    },
  });

  // Add to queue
  const lastInQueue = await prisma.queueEntry.findFirst({
    where: { sessionId: params.id },
    orderBy: { position: "desc" },
  });

  await prisma.queueEntry.create({
    data: {
      sessionId: params.id,
      userId,
      position: (lastInQueue?.position || 0) + 1,
      status: "WAITING",
    },
  });

  return NextResponse.json(updated);
}
