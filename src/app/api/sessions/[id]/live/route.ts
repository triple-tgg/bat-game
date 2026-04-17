import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[id]/live - Server-Sent Events for live dashboard
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      const fetchAndSend = async () => {
        try {
          const session = await prisma.session.findUnique({
            where: { id: id },
            include: { venue: { include: { courts: true } } },
          });

          const activeMatches = await prisma.match.findMany({
            where: { sessionId: id, status: "IN_PROGRESS" },
            include: {
              players: {
                include: {
                  user: { select: { id: true, name: true, avatarUrl: true, rankTier: true } },
                },
              },
            },
            orderBy: { courtNumber: "asc" },
          });

          const queue = await prisma.queueEntry.findMany({
            where: { sessionId: id, status: "WAITING" },
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { position: "asc" },
          });

          const playerCount = await prisma.sessionPlayer.count({
            where: { sessionId: id },
          });

          const checkedInCount = await prisma.sessionPlayer.count({
            where: {
              sessionId: id,
              status: { in: ["CHECKED_IN", "PLAYING", "WAITING"] },
            },
          });

          sendEvent({
            type: "update",
            session,
            activeMatches,
            queue: queue.map((q) => ({
              ...q,
              currentWaitSeconds: Math.floor(
                (Date.now() - q.joinedAt.getTime()) / 1000
              ),
            })),
            stats: { playerCount, checkedInCount },
          });
        } catch {
          // Session may have been deleted
          controller.close();
        }
      };

      // Send initial data
      await fetchAndSend();

      // Poll every 3 seconds
      const interval = setInterval(fetchAndSend, 3000);

      // Clean up on close
      _request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
