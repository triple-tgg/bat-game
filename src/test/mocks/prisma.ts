import { vi } from "vitest";

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  achievement: {
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
  userAchievement: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
