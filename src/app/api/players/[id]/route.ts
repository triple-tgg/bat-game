import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^0[0-9]{8,9}$/).optional(),
  avatarUrl: z.string().url().optional(),
});

// GET /api/players/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phone: true,
      avatarUrl: true,
      rankPoints: true,
      rankTier: true,
      totalWins: true,
      totalLosses: true,
      totalSessions: true,
      streak: true,
      createdAt: true,
      clubMemberships: {
        include: { club: { select: { id: true, name: true } } },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/players/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = UpdateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, name: true, phone: true, avatarUrl: true },
  });

  return NextResponse.json(user);
}
