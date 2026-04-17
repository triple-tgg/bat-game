import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

// GET /api/finance/summary?clubId=&period=monthly|yearly|all
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");
  const period = searchParams.get("period") || "monthly";

  const now = new Date();
  let dateFilter: { gte?: Date; lte?: Date } = {};

  if (period === "monthly") {
    dateFilter = { gte: startOfMonth(now), lte: endOfMonth(now) };
  } else if (period === "yearly") {
    dateFilter = { gte: startOfYear(now), lte: endOfYear(now) };
  }

  const sessionWhere = {
    ...(clubId ? { clubId } : {}),
    ...(dateFilter.gte ? { date: dateFilter } : {}),
    status: "COMPLETED" as const,
  };

  // Aggregate expenses
  const expenses = await prisma.expense.findMany({
    where: { session: sessionWhere },
    select: { category: true, amount: true },
  });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const courtCosts = expenses
    .filter((e) => e.category === "COURT")
    .reduce((s, e) => s + e.amount, 0);
  const shuttlecockCosts = expenses
    .filter((e) => e.category === "SHUTTLECOCK")
    .reduce((s, e) => s + e.amount, 0);
  const otherCosts = expenses
    .filter((e) => e.category === "OTHER")
    .reduce((s, e) => s + e.amount, 0);

  // Aggregate payments received
  const payments = await prisma.payment.findMany({
    where: {
      status: "PAID",
      session: sessionWhere,
    },
    select: { amount: true },
  });
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  // Unpaid amounts
  const unpaidPlayers = await prisma.sessionPlayer.findMany({
    where: {
      session: sessionWhere,
      paymentStatus: { not: "PAID" },
      amountDue: { gt: 0 },
    },
    select: { amountDue: true, amountPaid: true },
  });
  const totalUnpaid = unpaidPlayers.reduce(
    (s, p) => s + (p.amountDue - p.amountPaid),
    0
  );

  // Session count
  const sessionCount = await prisma.session.count({ where: sessionWhere });

  // Shuttlecock count
  const shuttlecockData = await prisma.session.aggregate({
    where: sessionWhere,
    _sum: { shuttlecockUsed: true },
  });

  // Sessions breakdown
  const sessionBreakdown = await prisma.session.findMany({
    where: sessionWhere,
    select: {
      id: true,
      title: true,
      date: true,
      totalCost: true,
      costPerPerson: true,
      shuttlecockUsed: true,
      _count: { select: { players: true } },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  return NextResponse.json({
    period,
    sessionCount,
    totalExpenses,
    breakdown: { court: courtCosts, shuttlecock: shuttlecockCosts, other: otherCosts },
    totalCollected,
    totalUnpaid,
    balance: totalCollected - totalExpenses,
    shuttlecockUsed: shuttlecockData._sum.shuttlecockUsed ?? 0,
    sessions: sessionBreakdown,
  });
}
