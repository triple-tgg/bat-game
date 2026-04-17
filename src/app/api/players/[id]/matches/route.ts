import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/players/[id]/matches
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const total = await prisma.matchPlayer.count({ where: { userId: params.id } });

  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { userId: params.id },
    include: {
      match: {
        include: {
          players: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          session: {
            select: { id: true, title: true, date: true, venue: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { match: { createdAt: "desc" } },
    skip,
    take: limit,
  });

  return NextResponse.json({
    data: matchPlayers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
