import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../../test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { GET, POST } = await import("../payments/route");

import { makeGetReq, makePostReq } from "./helpers";

const makePayment = (overrides = {}) => ({
  id: "pay-1",
  sessionId: "sess-1",
  userId: "user-1",
  amount: 150,
  method: "CASH",
  note: null,
  status: "PAID",
  paidAt: new Date(),
  createdAt: new Date(),
  user: { id: "user-1", name: "Alice" },
  session: { id: "sess-1", title: "Monday Game", date: new Date() },
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("GET /api/payments", () => {
  it("returns all payments when no filters", async () => {
    prismaMock.payment.findMany.mockResolvedValue([makePayment()]);

    const res = await GET(makeGetReq("/api/payments"));
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(prismaMock.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it("filters by sessionId", async () => {
    prismaMock.payment.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/payments?sessionId=sess-1"));

    expect(prismaMock.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sessionId: "sess-1" } })
    );
  });

  it("filters by userId", async () => {
    prismaMock.payment.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/payments?userId=user-1"));

    expect(prismaMock.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
  });

  it("filters by status", async () => {
    prismaMock.payment.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/payments?status=UNPAID"));

    expect(prismaMock.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "UNPAID" } })
    );
  });

  it("supports combining multiple filters", async () => {
    prismaMock.payment.findMany.mockResolvedValue([]);

    await GET(makeGetReq("/api/payments?sessionId=sess-1&userId=user-1"));

    expect(prismaMock.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId: "sess-1", userId: "user-1" },
      })
    );
  });
});

describe("POST /api/payments", () => {
  it("creates a PAID payment and returns 201", async () => {
    const created = makePayment();
    prismaMock.payment.create.mockResolvedValue(created);
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);

    const res = await POST(
      makePostReq("/api/payments", {
        sessionId: "sess-1",
        userId: "user-1",
        amount: 150,
        method: "CASH",
      })
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("pay-1");
  });

  it("sets paidAt timestamp on create", async () => {
    prismaMock.payment.create.mockResolvedValue(makePayment());
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);

    await POST(
      makePostReq("/api/payments", {
        sessionId: "sess-1",
        userId: "user-1",
        amount: 100,
      })
    );

    const createArg = prismaMock.payment.create.mock.calls[0][0];
    expect(createArg.data.status).toBe("PAID");
    expect(createArg.data.paidAt).toBeInstanceOf(Date);
  });

  it("returns 400 when sessionId is missing", async () => {
    const res = await POST(
      makePostReq("/api/payments", { userId: "user-1", amount: 100 })
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 when userId is missing", async () => {
    const res = await POST(
      makePostReq("/api/payments", { sessionId: "sess-1", amount: 100 })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const res = await POST(
      makePostReq("/api/payments", { sessionId: "sess-1", userId: "user-1" })
    );

    expect(res.status).toBe(400);
  });

  it("updates sessionPlayer to PAID when full amount covered", async () => {
    prismaMock.payment.create.mockResolvedValue(makePayment({ amount: 150 }));
    prismaMock.sessionPlayer.findFirst.mockResolvedValue({
      id: "sp-1",
      amountDue: 150,
      amountPaid: 0,
    });
    prismaMock.sessionPlayer.update.mockResolvedValue({});

    await POST(
      makePostReq("/api/payments", {
        sessionId: "sess-1",
        userId: "user-1",
        amount: 150,
      })
    );

    expect(prismaMock.sessionPlayer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: "PAID" }),
      })
    );
  });

  it("updates sessionPlayer to PARTIAL when partial amount paid", async () => {
    prismaMock.payment.create.mockResolvedValue(makePayment({ amount: 50 }));
    prismaMock.sessionPlayer.findFirst.mockResolvedValue({
      id: "sp-1",
      amountDue: 150,
      amountPaid: 0,
    });
    prismaMock.sessionPlayer.update.mockResolvedValue({});

    await POST(
      makePostReq("/api/payments", {
        sessionId: "sess-1",
        userId: "user-1",
        amount: 50,
      })
    );

    expect(prismaMock.sessionPlayer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: "PARTIAL" }),
      })
    );
  });

  it("skips sessionPlayer update when player not in session", async () => {
    prismaMock.payment.create.mockResolvedValue(makePayment());
    prismaMock.sessionPlayer.findFirst.mockResolvedValue(null);

    await POST(
      makePostReq("/api/payments", {
        sessionId: "sess-1",
        userId: "user-1",
        amount: 100,
      })
    );

    expect(prismaMock.sessionPlayer.update).not.toHaveBeenCalled();
  });
});
