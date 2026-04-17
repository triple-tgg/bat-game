import { vi } from "vitest";

// Mock @prisma/client to avoid needing a real DB in unit tests
vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn(),
    RankTier: {
      BRONZE: "BRONZE",
      SILVER: "SILVER",
      GOLD: "GOLD",
      PLATINUM: "PLATINUM",
      DIAMOND: "DIAMOND",
    },
  };
});
