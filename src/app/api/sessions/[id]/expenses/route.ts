import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[id]/expenses
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const expenses = await prisma.expense.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "desc" },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const playerCount = await prisma.sessionPlayer.count({
    where: { sessionId: id, status: { not: "LEFT" } },
  });

  return NextResponse.json({
    expenses,
    total,
    playerCount,
    perPerson: playerCount > 0 ? Math.ceil(total / playerCount) : 0,
  });
}

// POST /api/sessions/[id]/expenses - Add expense
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { category, amount, description } = body;

  if (!category || !amount) {
    return NextResponse.json(
      { error: "category and amount are required" },
      { status: 400 }
    );
  }

  const expense = await prisma.expense.create({
    data: {
      sessionId: id,
      category,
      amount,
      description,
    },
  });

  // Recalculate total cost and per-person cost
  const allExpenses = await prisma.expense.findMany({
    where: { sessionId: id },
  });
  const totalCost = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const playerCount = await prisma.sessionPlayer.count({
    where: { sessionId: id, status: { not: "LEFT" } },
  });
  const costPerPerson = playerCount > 0 ? Math.ceil(totalCost / playerCount) : 0;

  await prisma.session.update({
    where: { id: id },
    data: { totalCost, costPerPerson },
  });

  // Update all players' amount due
  await prisma.sessionPlayer.updateMany({
    where: { sessionId: id, status: { not: "LEFT" } },
    data: { amountDue: costPerPerson },
  });

  return NextResponse.json(expense, { status: 201 });
}
