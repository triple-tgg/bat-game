import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/clubs/[id]/members — add member to club
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { userId, role = "MEMBER", inviteCode } = body;

  // Allow joining via invite code without userId (link-based)
  if (inviteCode) {
    const club = await prisma.club.findUnique({
      where: { inviteCode, id: params.id },
    });
    if (!club) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const existing = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: params.id, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  const member = await prisma.clubMember.create({
    data: { clubId: params.id, userId, role },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/clubs/[id]/members — remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await request.json();

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: params.id, userId } },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (member.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove club owner" }, { status: 400 });
  }

  await prisma.clubMember.delete({
    where: { clubId_userId: { clubId: params.id, userId } },
  });

  return NextResponse.json({ success: true });
}
