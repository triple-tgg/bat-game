import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payments - Get payments with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (sessionId) where.sessionId = sessionId;
  if (userId) where.userId = userId;
  if (status) where.status = status;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
      session: { select: { id: true, title: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

// POST /api/payments - Record payment
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, userId, amount, method, note } = body;

  if (!sessionId || !userId || !amount) {
    return NextResponse.json(
      { error: "sessionId, userId, and amount are required" },
      { status: 400 }
    );
  }

  const payment = await prisma.payment.create({
    data: {
      sessionId,
      userId,
      amount,
      method,
      note,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  // Update session player payment status
  const sessionPlayer = await prisma.sessionPlayer.findFirst({
    where: { sessionId, userId },
  });

  if (sessionPlayer) {
    const newAmountPaid = sessionPlayer.amountPaid + amount;
    await prisma.sessionPlayer.update({
      where: { id: sessionPlayer.id },
      data: {
        amountPaid: newAmountPaid,
        paymentStatus:
          newAmountPaid >= sessionPlayer.amountDue ? "PAID" : "PARTIAL",
      },
    });
  }

  return NextResponse.json(payment, { status: 201 });
}
