import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/shuttlecock — record shuttlecock usage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { count = 1, costPerShuttlecock } = body;

  const session = await prisma.session.findUnique({ where: { id: params.id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const newCount = session.shuttlecockUsed + count;
  const unitCost = costPerShuttlecock ?? (count > 0 ? session.shuttlecockCost / Math.max(session.shuttlecockUsed, 1) : 75);
  const costAdded = count * unitCost;

  const updated = await prisma.session.update({
    where: { id: params.id },
    data: {
      shuttlecockUsed: newCount,
      shuttlecockCost: { increment: costAdded },
    },
    select: { id: true, shuttlecockUsed: true, shuttlecockCost: true },
  });

  // Add to expense record
  await prisma.expense.create({
    data: {
      sessionId: params.id,
      category: "SHUTTLECOCK",
      amount: costAdded,
      description: `ลูกขนไก่ ${count} ลูก`,
    },
  });

  return NextResponse.json(updated);
}
