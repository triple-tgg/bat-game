import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShareToken } from "@/lib/utils";

// GET /api/clubs - List clubs
export async function GET() {
  const clubs = await prisma.club.findMany({
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clubs);
}

// POST /api/clubs - Create a new club
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, ownerId } = body;

  if (!name || !ownerId) {
    return NextResponse.json(
      { error: "Name and ownerId are required" },
      { status: 400 }
    );
  }

  const club = await prisma.club.create({
    data: {
      name,
      description,
      ownerId,
      inviteCode: generateShareToken(),
      members: {
        create: {
          userId: ownerId,
          role: "OWNER",
        },
      },
    },
    include: { owner: true, members: true },
  });

  return NextResponse.json(club, { status: 201 });
}
