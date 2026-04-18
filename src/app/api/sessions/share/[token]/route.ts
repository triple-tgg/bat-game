import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/share/[token] — look up a session by its public share token
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const session = await prisma.session.findUnique({
    where: { shareToken: token },
    include: {
      venue: { select: { id: true, name: true, address: true } },
      _count: { select: { players: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status === "CANCELLED" || session.status === "COMPLETED") {
    return NextResponse.json(
      { error: "This session is no longer accepting registrations" },
      { status: 410 }
    );
  }

  const spotsLeft = Math.max(0, session.maxPlayers - session._count.players);

  return NextResponse.json({
    ...session,
    isFull: spotsLeft === 0,
    spotsLeft,
  });
}
