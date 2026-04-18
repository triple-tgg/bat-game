import { vi } from "vitest";

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  club: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  sessionPlayer: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  match: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  matchPlayer: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  queueEntry: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  payment: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  expense: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  rankHistory: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  achievement: {
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
  userAchievement: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  // Raw query support for complex joins
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
