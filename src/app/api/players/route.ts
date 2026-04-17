import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().regex(/^0[0-9]{8,9}$/).optional(),
  email: z.string().email().optional(),
  lineId: z.string().optional(),
});

// POST /api/players — register new player
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, phone, email, lineId } = parsed.data;

  // Check duplicate
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(email ? [{ email }] : []),
        ...(lineId ? [{ lineId }] : []),
      ],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Player already registered with this phone/email/LINE" },
      { status: 409 }
    );
  }

  const player = await prisma.user.create({
    data: { name, phone, email, lineId, role: "MEMBER" },
    select: { id: true, name: true, phone: true, rankTier: true, createdAt: true },
  });

  return NextResponse.json(player, { status: 201 });
}

// GET /api/players — search players
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const clubId = searchParams.get("clubId");

  const players = await prisma.user.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(clubId
        ? { clubMemberships: { some: { clubId } } }
        : {}),
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      rankTier: true,
      rankPoints: true,
      totalSessions: true,
    },
    orderBy: { rankPoints: "desc" },
    take: 20,
  });

  return NextResponse.json(players);
}
