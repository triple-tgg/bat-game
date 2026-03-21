import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[id]/queue - Get queue for a session
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const queue = await prisma.queueEntry.findMany({
    where: { sessionId: params.id, status: "WAITING" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, rankTier: true } },
    },
    orderBy: { position: "asc" },
  });

  // Calculate wait times
  const now = new Date();
  const queueWithWait = queue.map((entry) => ({
    ...entry,
    currentWaitSeconds: Math.floor(
      (now.getTime() - entry.joinedAt.getTime()) / 1000
    ),
  }));

  return NextResponse.json(queueWithWait);
}
