import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateShareToken } from "@/lib/utils";

const CreateSessionSchema = z.object({
  title: z.string().min(2).max(100),
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxPlayers: z.number().int().min(2).max(100).default(20),
  costPerPerson: z.number().min(0).default(0),
  venueId: z.string().cuid(),
  clubId: z.string().cuid(),
  isRecurring: z.boolean().default(false),
  recurringRule: z.string().optional(),
  notes: z.string().optional(),
});

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
  const parsed = CreateSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, date, startTime, endTime, maxPlayers, costPerPerson, venueId, clubId, isRecurring, recurringRule, notes } = parsed.data;

  const session = await prisma.session.create({
    data: {
      title,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxPlayers,
      costPerPerson,
      venueId,
      clubId,
      shareToken: generateShareToken(),
      isRecurring,
      recurringRule,
      notes,
      status: "OPEN",
    },
    include: { venue: true },
  });

  return NextResponse.json(session, { status: 201 });
}
