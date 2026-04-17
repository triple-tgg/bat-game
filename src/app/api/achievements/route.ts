import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/achievements — list all achievements
export async function GET() {
  const achievements = await prisma.achievement.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(achievements);
}

// POST /api/achievements — create achievement (admin)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, iconUrl, condition } = body;

  if (!name || !description || !condition) {
    return NextResponse.json(
      { error: "name, description, and condition are required" },
      { status: 400 }
    );
  }

  const achievement = await prisma.achievement.create({
    data: {
      name,
      description,
      iconUrl,
      condition: JSON.stringify(condition),
    },
  });

  return NextResponse.json(achievement, { status: 201 });
}
