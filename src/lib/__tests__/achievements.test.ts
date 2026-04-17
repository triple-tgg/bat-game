import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../../test/mocks/prisma";

// Mock prisma BEFORE importing the module under test
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// Dynamic import to ensure mock is applied first
const { checkAndAwardAchievements, seedAchievements } = await import("../achievements");

const makeUser = (overrides = {}) => ({
  id: "user-1",
  totalSessions: 0,
  totalWins: 0,
  totalLosses: 0,
  streak: 0,
  achievements: [],
  ...overrides,
});

const makeAchievement = (type: string, value: number, id = `ach-${type}-${value}`) => ({
  id,
  name: `Test ${type} ${value}`,
  description: "Test",
  iconUrl: null,
  condition: JSON.stringify({ type, value }),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkAndAwardAchievements()", () => {
  it("does nothing when user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await checkAndAwardAchievements("nonexistent");
    expect(prismaMock.userAchievement.create).not.toHaveBeenCalled();
  });

  it("awards session achievement when sessions threshold met", async () => {
    const user = makeUser({ totalSessions: 1 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("sessions", 1),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).toHaveBeenCalledWith({
      data: { userId: "user-1", achievementId: "ach-sessions-1" },
    });
  });

  it("does not award session achievement when sessions below threshold", async () => {
    const user = makeUser({ totalSessions: 0 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("sessions", 1),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).not.toHaveBeenCalled();
  });

  it("awards wins achievement when wins threshold met", async () => {
    const user = makeUser({ totalWins: 5 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("wins", 5),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).toHaveBeenCalledTimes(1);
  });

  it("awards streak achievement when streak threshold met", async () => {
    const user = makeUser({ streak: 3 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("streak", 3),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).toHaveBeenCalledTimes(1);
  });

  it("awards winRate achievement when winRate >= threshold and >= 20 total games", async () => {
    // 15 wins, 5 losses = 75% win rate, 20 total games
    const user = makeUser({ totalWins: 15, totalLosses: 5 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("winRate", 70),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).toHaveBeenCalledTimes(1);
  });

  it("does NOT award winRate achievement when fewer than 20 total games", async () => {
    // 18 wins, 1 loss = 94.7% win rate, but only 19 total games
    const user = makeUser({ totalWins: 18, totalLosses: 1 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("winRate", 70),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).not.toHaveBeenCalled();
  });

  it("does NOT award winRate achievement when win rate below threshold", async () => {
    // 13 wins, 7 losses = 65% — below 70% threshold
    const user = makeUser({ totalWins: 13, totalLosses: 7 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("winRate", 70),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).not.toHaveBeenCalled();
  });

  it("skips already-earned achievements", async () => {
    const achId = "ach-sessions-1";
    const user = makeUser({
      totalSessions: 5,
      achievements: [{ achievementId: achId }],
    });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("sessions", 1, achId),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).not.toHaveBeenCalled();
  });

  it("awards multiple achievements in one call", async () => {
    const user = makeUser({ totalSessions: 10, totalWins: 5 });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.achievement.findMany.mockResolvedValue([
      makeAchievement("sessions", 1, "ach-1"),
      makeAchievement("sessions", 10, "ach-2"),
      makeAchievement("wins", 5, "ach-3"),
    ]);

    await checkAndAwardAchievements("user-1");

    expect(prismaMock.userAchievement.create).toHaveBeenCalledTimes(3);
  });
});

describe("seedAchievements()", () => {
  it("upserts all 8 default achievements", async () => {
    prismaMock.achievement.upsert.mockResolvedValue({} as never);

    await seedAchievements();

    expect(prismaMock.achievement.upsert).toHaveBeenCalledTimes(8);
  });

  it("uses achievement name as unique identifier for upsert", async () => {
    prismaMock.achievement.upsert.mockResolvedValue({} as never);

    await seedAchievements();

    const firstCall = prismaMock.achievement.upsert.mock.calls[0][0];
    expect(firstCall).toHaveProperty("where.name");
    expect(typeof firstCall.where.name).toBe("string");
  });

  it("stores condition as JSON string", async () => {
    prismaMock.achievement.upsert.mockResolvedValue({} as never);

    await seedAchievements();

    const firstCall = prismaMock.achievement.upsert.mock.calls[0][0];
    const conditionStr = firstCall.create.condition;
    expect(() => JSON.parse(conditionStr)).not.toThrow();
    const condition = JSON.parse(conditionStr);
    expect(condition).toHaveProperty("type");
    expect(condition).toHaveProperty("value");
  });
});
