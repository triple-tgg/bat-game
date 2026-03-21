import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/join - Join a session (member or guest)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { userId, guestName, guestPhone } = body;

  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { _count: { select: { players: true } } },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "OPEN" && session.status !== "FULL") {
    return NextResponse.json(
      { error: "Session is not open for registration" },
      { status: 400 }
    );
  }

  // Check if already joined
  if (userId) {
    const existing = await prisma.sessionPlayer.findFirst({
      where: { sessionId: params.id, userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Already joined this session" },
        { status: 400 }
      );
    }
  }

  const isFull = session._count.players >= session.maxPlayers;

  const player = await prisma.sessionPlayer.create({
    data: {
      sessionId: params.id,
      userId: userId || null,
      guestName: !userId ? guestName : null,
      guestPhone: !userId ? guestPhone : null,
      status: isFull ? "WAITING" : "REGISTERED",
    },
  });

  // Update session status if full
  if (!isFull && session._count.players + 1 >= session.maxPlayers) {
    await prisma.session.update({
      where: { id: params.id },
      data: { status: "FULL" },
    });
  }

  return NextResponse.json(player, { status: 201 });
}
