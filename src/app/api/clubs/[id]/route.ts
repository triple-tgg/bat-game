import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShareToken } from "@/lib/utils";

// GET /api/clubs/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const club = await prisma.club.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true, rankTier: true, rankPoints: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      venues: { include: { courts: true } },
      _count: { select: { sessions: true } },
    },
  });

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  return NextResponse.json(club);
}

// PATCH /api/clubs/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { name, description, regenerateInvite } = body;

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (description !== undefined) data.description = description;
  if (regenerateInvite) data.inviteCode = generateShareToken();

  const club = await prisma.club.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(club);
}

// DELETE /api/clubs/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const activeSessions = await prisma.session.count({
    where: {
      clubId: params.id,
      status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
    },
  });

  if (activeSessions > 0) {
    return NextResponse.json(
      { error: "Cannot delete club with active sessions" },
      { status: 400 }
    );
  }

  await prisma.club.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
