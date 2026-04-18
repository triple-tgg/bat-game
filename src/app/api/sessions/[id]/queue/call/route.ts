import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/queue/call — call N players from waiting queue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { count } = body;

  if (!count || count <= 0) {
    return NextResponse.json(
      { error: "count must be a positive integer" },
      { status: 400 }
    );
  }

  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const waiting = await prisma.queueEntry.findMany({
    where: { sessionId: id, status: "WAITING" },
    orderBy: { position: "asc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, rankTier: true } },
    },
  });

  if (waiting.length < count) {
    return NextResponse.json(
      {
        error: "Not enough players in queue",
        requested: count,
        available: waiting.length,
      },
      { status: 400 }
    );
  }

  const toCall = waiting.slice(0, count);
  const now = new Date();

  for (const entry of toCall) {
    const waitDurationSeconds = Math.floor(
      (now.getTime() - entry.joinedAt.getTime()) / 1000
    );

    await prisma.queueEntry.update({
      where: { id: entry.id },
      data: {
        status: "CALLED",
        calledAt: now,
        waitDurationSeconds,
      },
    });

    await prisma.sessionPlayer.updateMany({
      where: { sessionId: id, userId: entry.userId },
      data: { status: "PLAYING" },
    });
  }

  return NextResponse.json({ called: toCall });
}
