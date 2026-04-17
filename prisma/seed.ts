import { PrismaClient } from "@prisma/client";
import { seedAchievements } from "../src/lib/achievements";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed achievements first
  await seedAchievements();
  console.log("✓ Achievements seeded");

  // Create owner user
  const owner = await prisma.user.upsert({
    where: { phone: "0800000001" },
    update: {},
    create: {
      name: "สมชาย (Admin)",
      phone: "0800000001",
      role: "ADMIN",
      rankPoints: 2150,
      rankTier: "DIAMOND",
      totalWins: 89,
      totalLosses: 21,
      totalSessions: 45,
      streak: 8,
    },
  });

  // Create demo players
  const playerData = [
    { name: "สมหญิง", phone: "0800000002", rankPoints: 1850, rankTier: "PLATINUM" as const, totalWins: 75, totalLosses: 30, totalSessions: 40 },
    { name: "วิชัย", phone: "0800000003", rankPoints: 1620, rankTier: "PLATINUM" as const, totalWins: 68, totalLosses: 35, totalSessions: 38 },
    { name: "พรทิพย์", phone: "0800000004", rankPoints: 1200, rankTier: "PLATINUM" as const, totalWins: 55, totalLosses: 32, totalSessions: 35 },
    { name: "อดิศร", phone: "0800000005", rankPoints: 980, rankTier: "GOLD" as const, totalWins: 48, totalLosses: 30, totalSessions: 30 },
    { name: "มานะ", phone: "0800000006", rankPoints: 820, rankTier: "GOLD" as const, totalWins: 40, totalLosses: 28, totalSessions: 28 },
    { name: "ปิยะ", phone: "0800000007", rankPoints: 650, rankTier: "GOLD" as const, totalWins: 35, totalLosses: 30, totalSessions: 25 },
    { name: "นภา", phone: "0800000008", rankPoints: 480, rankTier: "SILVER" as const, totalWins: 28, totalLosses: 25, totalSessions: 22 },
    { name: "ธนา", phone: "0800000009", rankPoints: 320, rankTier: "SILVER" as const, totalWins: 20, totalLosses: 22, totalSessions: 18 },
    { name: "สุดา", phone: "0800000010", rankPoints: 180, rankTier: "BRONZE" as const, totalWins: 12, totalLosses: 18, totalSessions: 12 },
  ];

  const players = [];
  for (const data of playerData) {
    const p = await prisma.user.upsert({
      where: { phone: data.phone },
      update: {},
      create: { ...data, role: "MEMBER" },
    });
    players.push(p);
  }
  console.log(`✓ ${players.length + 1} players seeded`);

  // Create club
  const club = await prisma.club.upsert({
    where: { inviteCode: "BADMIN01" },
    update: {},
    create: {
      name: "ก๊วนแบดมินตันสุขุมวิท",
      description: "ก๊วนแบดมินตันเพื่อสุขภาพ เล่นทุกอังคาร-พฤหัส",
      inviteCode: "BADMIN01",
      ownerId: owner.id,
    },
  });

  // Add members to club
  const allPlayers = [owner, ...players];
  for (const player of allPlayers) {
    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: club.id, userId: player.id } },
      update: {},
      create: {
        clubId: club.id,
        userId: player.id,
        role: player.id === owner.id ? "OWNER" : "MEMBER",
      },
    });
  }
  console.log("✓ Club and members seeded");

  // Create venue
  const venue = await prisma.venue.create({
    data: {
      name: "สนามแบดมินตัน A",
      address: "123 ถนนสุขุมวิท กรุงเทพ",
      courtsCount: 4,
      pricePerHour: 400,
      contactInfo: "02-123-4567",
      clubId: club.id,
      courts: {
        create: [
          { number: 1, name: "Court 1" },
          { number: 2, name: "Court 2" },
          { number: 3, name: "Court 3" },
          { number: 4, name: "Court 4" },
        ],
      },
    },
  });
  console.log("✓ Venue and courts seeded");

  // Create upcoming session
  const nextTuesday = new Date();
  nextTuesday.setDate(nextTuesday.getDate() + ((2 - nextTuesday.getDay() + 7) % 7 || 7));
  nextTuesday.setHours(18, 0, 0, 0);
  const nextTuesdayEnd = new Date(nextTuesday);
  nextTuesdayEnd.setHours(21, 0, 0, 0);

  const session = await prisma.session.create({
    data: {
      title: "แบดมินตันวันอังคาร",
      date: nextTuesday,
      startTime: nextTuesday,
      endTime: nextTuesdayEnd,
      maxPlayers: 20,
      costPerPerson: 150,
      venueId: venue.id,
      clubId: club.id,
      shareToken: "DEMO2024",
      status: "OPEN",
    },
  });

  // Register players to session
  for (const player of allPlayers.slice(0, 8)) {
    await prisma.sessionPlayer.create({
      data: {
        sessionId: session.id,
        userId: player.id,
        status: "REGISTERED",
      },
    });
  }
  console.log("✓ Demo session seeded");

  // Award some achievements
  for (const player of allPlayers) {
    const starter = await prisma.achievement.findFirst({ where: { name: "มือใหม่" } });
    if (starter) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: player.id, achievementId: starter.id } },
        update: {},
        create: { userId: player.id, achievementId: starter.id },
      });
    }
  }
  console.log("✓ Starter achievements awarded");

  console.log("\n✅ Seed complete!");
  console.log(`   Club invite code: BADMIN01`);
  console.log(`   Session share token: DEMO2024`);
  console.log(`   Join session: /join/DEMO2024`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
