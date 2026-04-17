import { prisma } from "./prisma";

interface AchievementCondition {
  type: "sessions" | "wins" | "streak" | "winRate";
  value: number;
}

const DEFAULT_ACHIEVEMENTS: {
  name: string;
  description: string;
  iconUrl: string;
  condition: AchievementCondition;
}[] = [
  {
    name: "มือใหม่",
    description: "เข้าร่วมกิจกรรมครั้งแรก",
    iconUrl: "🏸",
    condition: { type: "sessions", value: 1 },
  },
  {
    name: "สมาชิกประจำ",
    description: "เข้าร่วมกิจกรรมครบ 10 ครั้ง",
    iconUrl: "⭐",
    condition: { type: "sessions", value: 10 },
  },
  {
    name: "นักรบแบดมินตัน",
    description: "เข้าร่วมกิจกรรมครบ 50 ครั้ง",
    iconUrl: "🏆",
    condition: { type: "sessions", value: 50 },
  },
  {
    name: "ชนะ 5 ครั้งแรก",
    description: "ชนะการแข่ง 5 ครั้ง",
    iconUrl: "✊",
    condition: { type: "wins", value: 5 },
  },
  {
    name: "ผู้ชนะ",
    description: "ชนะการแข่ง 50 ครั้ง",
    iconUrl: "👑",
    condition: { type: "wins", value: 50 },
  },
  {
    name: "Streak 3",
    description: "เข้าร่วมติดต่อกัน 3 ครั้ง",
    iconUrl: "🔥",
    condition: { type: "streak", value: 3 },
  },
  {
    name: "Streak 10",
    description: "เข้าร่วมติดต่อกัน 10 ครั้ง",
    iconUrl: "🌟",
    condition: { type: "streak", value: 10 },
  },
  {
    name: "MVP",
    description: "Win rate 70%+ (ขั้นต่ำ 20 เกม)",
    iconUrl: "🦅",
    condition: { type: "winRate", value: 70 },
  },
];

export async function seedAchievements() {
  for (const a of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: {},
      create: {
        name: a.name,
        description: a.description,
        iconUrl: a.iconUrl,
        condition: JSON.stringify(a.condition),
      },
    });
  }
}

export async function checkAndAwardAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: { select: { achievementId: true } } },
  });
  if (!user) return;

  const earnedIds = new Set(user.achievements.map((a) => a.achievementId));
  const allAchievements = await prisma.achievement.findMany();

  const totalGames = user.totalWins + user.totalLosses;
  const winRate = totalGames >= 20 ? (user.totalWins / totalGames) * 100 : 0;

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    const cond: AchievementCondition = JSON.parse(achievement.condition);
    let earned = false;

    if (cond.type === "sessions" && user.totalSessions >= cond.value) earned = true;
    if (cond.type === "wins" && user.totalWins >= cond.value) earned = true;
    if (cond.type === "streak" && user.streak >= cond.value) earned = true;
    if (cond.type === "winRate" && winRate >= cond.value) earned = true;

    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
    }
  }
}
