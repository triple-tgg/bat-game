import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/venues - List venues
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  const venues = await prisma.venue.findMany({
    where: clubId ? { clubId } : {},
    include: {
      courts: true,
      _count: { select: { sessions: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(venues);
}

// POST /api/venues - Create venue
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, address, courtsCount, pricePerHour, contactInfo, clubId } = body;

  if (!name || !clubId) {
    return NextResponse.json(
      { error: "name and clubId are required" },
      { status: 400 }
    );
  }

  const venue = await prisma.venue.create({
    data: {
      name,
      address,
      courtsCount: courtsCount || 1,
      pricePerHour: pricePerHour || 0,
      contactInfo,
      clubId,
      courts: {
        create: Array.from({ length: courtsCount || 1 }, (_, i) => ({
          number: i + 1,
          name: `Court ${i + 1}`,
        })),
      },
    },
    include: { courts: true },
  });

  return NextResponse.json(venue, { status: 201 });
}
