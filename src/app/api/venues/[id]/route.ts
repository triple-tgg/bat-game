import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/venues/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      courts: { orderBy: { number: "asc" } },
      _count: { select: { sessions: true } },
    },
  });

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  return NextResponse.json(venue);
}

// PUT /api/venues/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { name, address, courtsCount, pricePerHour, contactInfo } = body;

  const current = await prisma.venue.findUnique({
    where: { id: params.id },
    include: { courts: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const venue = await prisma.venue.update({
    where: { id: params.id },
    data: { name, address, pricePerHour, contactInfo },
  });

  // Sync courts if count changed
  if (courtsCount !== undefined && courtsCount !== current.courtsCount) {
    if (courtsCount > current.courtsCount) {
      // Add new courts
      for (let i = current.courtsCount + 1; i <= courtsCount; i++) {
        await prisma.court.create({
          data: { venueId: params.id, number: i, name: `Court ${i}` },
        });
      }
    } else {
      // Remove excess courts (only if no matches)
      const excess = current.courts.filter((c) => c.number > courtsCount);
      for (const court of excess) {
        const hasMatches = await prisma.match.count({ where: { courtId: court.id } });
        if (hasMatches === 0) {
          await prisma.court.delete({ where: { id: court.id } });
        }
      }
    }
    await prisma.venue.update({
      where: { id: params.id },
      data: { courtsCount },
    });
  }

  return NextResponse.json(venue);
}

// DELETE /api/venues/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const activeSessions = await prisma.session.count({
    where: {
      venueId: params.id,
      status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
    },
  });

  if (activeSessions > 0) {
    return NextResponse.json(
      { error: "Cannot delete venue with active sessions" },
      { status: 400 }
    );
  }

  await prisma.venue.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
