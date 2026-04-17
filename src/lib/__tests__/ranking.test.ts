import { describe, it, expect } from "vitest";
import {
  calculateRankTier,
  calculateWinRate,
  getStreakBonus,
  RANK_POINTS,
  RANK_TIERS,
} from "../ranking";

describe("RANK_POINTS constants", () => {
  it("should define correct points for each action", () => {
    expect(RANK_POINTS.SESSION_JOIN).toBe(10);
    expect(RANK_POINTS.MATCH_WIN).toBe(15);
    expect(RANK_POINTS.MATCH_LOSS).toBe(5);
    expect(RANK_POINTS.STREAK_BONUS_3).toBe(20);
    expect(RANK_POINTS.STREAK_BONUS_5).toBe(40);
    expect(RANK_POINTS.STREAK_BONUS_10).toBe(100);
  });
});

describe("RANK_TIERS thresholds", () => {
  it("should have 5 tiers ordered from highest to lowest", () => {
    expect(RANK_TIERS).toHaveLength(5);
    expect(RANK_TIERS[0].tier).toBe("DIAMOND");
    expect(RANK_TIERS[1].tier).toBe("PLATINUM");
    expect(RANK_TIERS[2].tier).toBe("GOLD");
    expect(RANK_TIERS[3].tier).toBe("SILVER");
    expect(RANK_TIERS[4].tier).toBe("BRONZE");
  });

  it("should have correct minimum points per tier", () => {
    expect(RANK_TIERS.find((t) => t.tier === "DIAMOND")?.minPoints).toBe(2000);
    expect(RANK_TIERS.find((t) => t.tier === "PLATINUM")?.minPoints).toBe(1000);
    expect(RANK_TIERS.find((t) => t.tier === "GOLD")?.minPoints).toBe(500);
    expect(RANK_TIERS.find((t) => t.tier === "SILVER")?.minPoints).toBe(200);
    expect(RANK_TIERS.find((t) => t.tier === "BRONZE")?.minPoints).toBe(0);
  });
});

describe("calculateRankTier()", () => {
  it("returns BRONZE for 0 points", () => {
    expect(calculateRankTier(0)).toBe("BRONZE");
  });

  it("returns BRONZE for points below SILVER threshold", () => {
    expect(calculateRankTier(1)).toBe("BRONZE");
    expect(calculateRankTier(199)).toBe("BRONZE");
  });

  it("returns SILVER at exactly 200 points", () => {
    expect(calculateRankTier(200)).toBe("SILVER");
  });

  it("returns SILVER for points between 200 and 499", () => {
    expect(calculateRankTier(201)).toBe("SILVER");
    expect(calculateRankTier(499)).toBe("SILVER");
  });

  it("returns GOLD at exactly 500 points", () => {
    expect(calculateRankTier(500)).toBe("GOLD");
  });

  it("returns GOLD for points between 500 and 999", () => {
    expect(calculateRankTier(501)).toBe("GOLD");
    expect(calculateRankTier(999)).toBe("GOLD");
  });

  it("returns PLATINUM at exactly 1000 points", () => {
    expect(calculateRankTier(1000)).toBe("PLATINUM");
  });

  it("returns PLATINUM for points between 1000 and 1999", () => {
    expect(calculateRankTier(1001)).toBe("PLATINUM");
    expect(calculateRankTier(1999)).toBe("PLATINUM");
  });

  it("returns DIAMOND at exactly 2000 points", () => {
    expect(calculateRankTier(2000)).toBe("DIAMOND");
  });

  it("returns DIAMOND for points above 2000", () => {
    expect(calculateRankTier(2001)).toBe("DIAMOND");
    expect(calculateRankTier(9999)).toBe("DIAMOND");
  });
});

describe("calculateWinRate()", () => {
  it("returns 0 when no games played", () => {
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  it("returns 100 when all games won", () => {
    expect(calculateWinRate(10, 0)).toBe(100);
  });

  it("returns 0 when all games lost", () => {
    expect(calculateWinRate(0, 10)).toBe(0);
  });

  it("returns 50 for equal wins and losses", () => {
    expect(calculateWinRate(5, 5)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    // 1/3 ≈ 33.33% → rounds to 33
    expect(calculateWinRate(1, 2)).toBe(33);
    // 2/3 ≈ 66.67% → rounds to 67
    expect(calculateWinRate(2, 1)).toBe(67);
  });
});

describe("getStreakBonus()", () => {
  it("returns 0 for streak below 3", () => {
    expect(getStreakBonus(0)).toBe(0);
    expect(getStreakBonus(1)).toBe(0);
    expect(getStreakBonus(2)).toBe(0);
  });

  it("returns STREAK_BONUS_3 for streak of exactly 3", () => {
    expect(getStreakBonus(3)).toBe(RANK_POINTS.STREAK_BONUS_3);
  });

  it("returns STREAK_BONUS_3 for streak between 3 and 4", () => {
    expect(getStreakBonus(4)).toBe(RANK_POINTS.STREAK_BONUS_3);
  });

  it("returns STREAK_BONUS_5 for streak of exactly 5", () => {
    expect(getStreakBonus(5)).toBe(RANK_POINTS.STREAK_BONUS_5);
  });

  it("returns STREAK_BONUS_5 for streak between 5 and 9", () => {
    expect(getStreakBonus(6)).toBe(RANK_POINTS.STREAK_BONUS_5);
    expect(getStreakBonus(9)).toBe(RANK_POINTS.STREAK_BONUS_5);
  });

  it("returns STREAK_BONUS_10 for streak of exactly 10", () => {
    expect(getStreakBonus(10)).toBe(RANK_POINTS.STREAK_BONUS_10);
  });

  it("returns STREAK_BONUS_10 for streak above 10", () => {
    expect(getStreakBonus(11)).toBe(RANK_POINTS.STREAK_BONUS_10);
    expect(getStreakBonus(100)).toBe(RANK_POINTS.STREAK_BONUS_10);
  });
});
