import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShareToken } from "@/lib/utils";

// GET /api/sessions - List sessions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (clubId) where.clubId = clubId;
  if (status) where.status = status;

  const sessions = await prisma.session.findMany({
    where,
    include: {
      venue: true,
      _count: { select: { players: true, matches: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(sessions);
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title,
    date,
    startTime,
    endTime,
    maxPlayers,
    costPerPerson,
    venueId,
    clubId,
    isRecurring,
    recurringRule,
    notes,
  } = body;

  if (!title || !date || !startTime || !endTime || !venueId || !clubId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const session = await prisma.session.create({
    data: {
      title,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxPlayers: maxPlayers || 20,
      costPerPerson: costPerPerson || 0,
      venueId,
      clubId,
      shareToken: generateShareToken(),
      isRecurring: isRecurring || false,
      recurringRule,
      notes,
      status: "OPEN",
    },
    include: { venue: true },
  });

  return NextResponse.json(session, { status: 201 });
}
