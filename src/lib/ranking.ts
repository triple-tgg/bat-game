import { RankTier } from "@prisma/client";

// Points awarded for different actions
export const RANK_POINTS = {
  SESSION_JOIN: 10,
  MATCH_WIN: 15,
  MATCH_LOSS: 5,
  STREAK_BONUS_3: 20, // 3 consecutive sessions
  STREAK_BONUS_5: 40, // 5 consecutive sessions
  STREAK_BONUS_10: 100, // 10 consecutive sessions
} as const;

// Rank tier thresholds
export const RANK_TIERS: { tier: RankTier; minPoints: number }[] = [
  { tier: "DIAMOND", minPoints: 2000 },
  { tier: "PLATINUM", minPoints: 1000 },
  { tier: "GOLD", minPoints: 500 },
  { tier: "SILVER", minPoints: 200 },
  { tier: "BRONZE", minPoints: 0 },
];

export function calculateRankTier(points: number): RankTier {
  for (const { tier, minPoints } of RANK_TIERS) {
    if (points >= minPoints) return tier;
  }
  return "BRONZE";
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function getStreakBonus(streak: number): number {
  if (streak >= 10) return RANK_POINTS.STREAK_BONUS_10;
  if (streak >= 5) return RANK_POINTS.STREAK_BONUS_5;
  if (streak >= 3) return RANK_POINTS.STREAK_BONUS_3;
  return 0;
}
