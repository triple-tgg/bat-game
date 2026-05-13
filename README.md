# 🏸 BadmintonHub

ระบบจัดการก๊วนแบดมินตันครบวงจร — จัดคิว จัดแร้งค์ บันทึกผล จัดการเงิน ดู Live สนาม

---

## Tech Stack

| Layer | เทคโนโลยี | เวอร์ชัน |
|-------|-----------|---------|
| Framework | Next.js App Router | 16.2.4 |
| Language | TypeScript | 5.4+ |
| Styling | Tailwind CSS | 4.2.2 |
| Database | PostgreSQL + Prisma ORM | PG 14+ / Prisma 5.14 |
| Auth | NextAuth.js (LINE + Phone) | 4.24 |
| Realtime | Server-Sent Events (SSE) | — |
| Testing | Vitest | 4.1.4 |
| Runtime | Node.js | 18+ |

---

## ฟีเจอร์หลัก

| # | ฟีเจอร์ | รายละเอียด |
|---|---------|-----------|
| 1 | **ระบบแร้งค์** | Bronze → Silver → Gold → Platinum → Diamond คิดคะแนนจากการเข้าร่วม ผลแข่ง และ streak |
| 2 | **จัดคิวอัตโนมัติ** | เช็คอิน → เข้าคิว FIFO → สุ่มจัดคู่ → เล่น → กลับคิว |
| 3 | **Matchmaking** | สุ่มแบบ Random หรือ Skill-based (Singles/Doubles) |
| 4 | **Live Dashboard** | ดูสถานะคอร์ทแบบ real-time ผ่าน SSE เหมาะแสดงบน TV |
| 5 | **จัดการเงิน** | บันทึกค่าสนาม ค่าลูก หารต่อคน ติดตามสถานะการจ่ายเงิน |
| 6 | **Share Link** | แชร์ลิงก์ให้ join กิจกรรมโดยไม่ต้องลงทะเบียน (Guest) |
| 7 | **กิจกรรมซ้ำ** | ตั้ง recurring session รายสัปดาห์/รายเดือนได้ |
| 8 | **Achievements** | ป้ายความสำเร็จ เช่น มือใหม่ นักสะสม แชมป์ streak |

---

## โครงสร้างโปรเจกต์

```
bat-game/
├── prisma/
│   ├── schema.prisma          # Database schema (15 models)
│   └── seed.ts                # Demo data (10 players, 1 club, 1 venue)
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout + Providers + Nav
│   │   ├── page.tsx           # หน้าแรก + Top 5 leaderboard
│   │   │
│   │   ├── login/             # หน้า Login (phone + LINE)
│   │   ├── profile/           # โปรไฟล์ผู้ใช้
│   │   ├── rankings/          # อันดับผู้เล่นทั้งหมด + podium
│   │   ├── finance/           # สรุปการเงิน (monthly/yearly/all)
│   │   ├── venues/            # รายการสนาม
│   │   ├── admin/             # หน้า Admin
│   │   │
│   │   ├── sessions/
│   │   │   ├── page.tsx       # รายการกิจกรรม
│   │   │   ├── new/           # สร้างกิจกรรมใหม่
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # จัดการกิจกรรม (tabs: courts/queue/matches/expenses)
│   │   │       └── live/      # Live dashboard (SSE)
│   │   │
│   │   ├── players/[id]/      # โปรไฟล์ผู้เล่น + สถิติ
│   │   ├── clubs/[id]/        # หน้าก๊วน
│   │   ├── join/[token]/      # Guest join ผ่าน share link
│   │   │
│   │   └── api/               # API Routes
│   │       ├── auth/[...nextauth]/   # NextAuth handler
│   │       ├── sessions/             # CRUD + actions
│   │       ├── players/              # ข้อมูล + สถิติ
│   │       ├── rankings/             # Leaderboard
│   │       ├── clubs/                # ก๊วน + สมาชิก
│   │       ├── venues/               # สนาม
│   │       ├── finance/              # สรุปการเงิน
│   │       ├── payments/             # การจ่ายเงิน
│   │       └── achievements/         # ความสำเร็จ
│   │
│   ├── components/
│   │   ├── NavUser.tsx        # Auth-aware nav (login/logout)
│   │   ├── Providers.tsx      # SessionProvider wrapper
│   │   ├── session/
│   │   │   └── QRCheckin.tsx  # QR Code สำหรับเช็คอิน
│   │   └── ui/
│   │       ├── RankBadge.tsx  # Badge แสดง rank tier
│   │       └── StatusBadge.tsx # Badge แสดงสถานะ session
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config (LINE + Credentials)
│   │   ├── ranking.ts         # คำนวณคะแนนและ tier
│   │   ├── matchmaking.ts     # Random + Skill-based matchmaking
│   │   ├── achievements.ts    # ตรวจสอบและมอบ achievement
│   │   ├── recurring.ts       # สร้าง session ซ้ำอัตโนมัติ
│   │   └── utils.ts           # formatCurrency, formatDuration, etc.
│   │
│   ├── middleware.ts           # Protect routes via NextAuth
│   ├── types/
│   │   └── next-auth.d.ts     # Type extension (session.user.id)
│   └── test/
│       ├── setup.ts           # Vitest global setup
│       └── mocks/prisma.ts    # Prisma mock สำหรับ unit tests
│
├── .env.example               # Environment variables template
├── SETUP.md                   # คู่มือติดตั้งและรัน local
├── SYSTEM_DESIGN.md           # รายละเอียด design ระบบ
└── README.md                  # ไฟล์นี้
```

---

## Database Schema

### Models (15 ตาราง)

```
User ──────────┬── ClubMember ──── Club ──── Venue ──── Court
               ├── SessionPlayer ─ Session ──┬── Match ──── MatchPlayer
               ├── MatchPlayer               ├── QueueEntry
               ├── QueueEntry                ├── Expense
               ├── RankHistory               └── Payment
               ├── Payment
               └── UserAchievement ── Achievement
```

| Model | ตาราง DB | ความหมาย |
|-------|---------|---------|
| `User` | `users` | ผู้เล่น — rank, stats, auth |
| `Club` | `clubs` | ก๊วนแบดมินตัน |
| `ClubMember` | `club_members` | สมาชิกก๊วน (OWNER/ADMIN/MEMBER) |
| `Venue` | `venues` | สนามแบดมินตัน |
| `Court` | `courts` | คอร์ทในสนาม |
| `Session` | `sessions` | กิจกรรม/ครั้งที่เล่น |
| `SessionPlayer` | `session_players` | ผู้เล่นในกิจกรรม + สถานะ + การจ่ายเงิน |
| `Match` | `matches` | รอบการแข่งขัน |
| `MatchPlayer` | `match_players` | ผู้เล่นในรอบ + ทีม + ผล |
| `QueueEntry` | `queue_entries` | คิวรอเล่น |
| `RankHistory` | `rank_history` | ประวัติการได้/เสียคะแนน |
| `Payment` | `payments` | บันทึกการจ่ายเงิน |
| `Expense` | `expenses` | รายการค่าใช้จ่ายต่อกิจกรรม |
| `Achievement` | `achievements` | นิยาม achievement |
| `UserAchievement` | `user_achievements` | achievement ที่ผู้เล่นได้รับ |

### Enums

| Enum | ค่าที่เป็นไปได้ |
|------|--------------|
| `SessionStatus` | DRAFT → OPEN → FULL → IN_PROGRESS → COMPLETED / CANCELLED |
| `PlayerStatus` | REGISTERED → CHECKED_IN → PLAYING → WAITING → LEFT |
| `RankTier` | BRONZE → SILVER → GOLD → PLATINUM → DIAMOND |
| `MatchStatus` | PENDING → IN_PROGRESS → COMPLETED / CANCELLED |
| `PaymentStatus` | UNPAID / PAID / PARTIAL |
| `QueueStatus` | WAITING → CALLED → PLAYING → DONE / SKIPPED |
| `ExpenseCategory` | COURT / SHUTTLECOCK / OTHER |

---

## API Endpoints

### Sessions

| Method | Path | ความหมาย |
|--------|------|---------|
| `GET` | `/api/sessions` | รายการกิจกรรม (filter by clubId, status) |
| `POST` | `/api/sessions` | สร้างกิจกรรมใหม่ |
| `GET` | `/api/sessions/[id]` | รายละเอียดกิจกรรม (venue, players, matches, expenses) |
| `PATCH` | `/api/sessions/[id]` | อัปเดตกิจกรรม |
| `DELETE` | `/api/sessions/[id]` | ยกเลิกกิจกรรม |
| `POST` | `/api/sessions/[id]?action=complete` | จบกิจกรรม + คำนวณ rank points |
| `POST` | `/api/sessions/[id]/checkin` | เช็คอิน `{ userId }` |
| `POST` | `/api/sessions/[id]/join` | Guest join ผ่าน token |
| `POST` | `/api/sessions/[id]/matchmake` | สุ่มจัดคู่ `{ strategy, matchType }` |
| `GET` | `/api/sessions/[id]/queue` | คิวรอปัจจุบัน |
| `POST` | `/api/sessions/[id]/queue/call` | เรียก N คนจากคิว `{ count }` |
| `GET` | `/api/sessions/[id]/matches` | รอบการแข่งทั้งหมด |
| `PUT` | `/api/sessions/[id]/matches` | บันทึกผล `{ matchId, team1Score, team2Score }` |
| `GET/POST` | `/api/sessions/[id]/expenses` | ดู/เพิ่มค่าใช้จ่าย |
| `PATCH` | `/api/sessions/[id]/shuttlecock` | อัปเดตจำนวนลูก |
| `GET` | `/api/sessions/[id]/live` | SSE stream สำหรับ live dashboard |
| `GET` | `/api/sessions/share/[token]` | ดูกิจกรรมผ่าน share token |

### Players & Rankings

| Method | Path | ความหมาย |
|--------|------|---------|
| `GET` | `/api/players` | รายชื่อผู้เล่นทั้งหมด |
| `GET` | `/api/players/[id]` | ข้อมูลผู้เล่น |
| `GET` | `/api/players/[id]/stats` | สถิติ + recent matches + best partners + achievements |
| `GET` | `/api/players/[id]/matches` | ประวัติการแข่งทั้งหมด |
| `GET` | `/api/rankings` | Leaderboard (query: `?limit=N`) |

### Clubs & Venues

| Method | Path | ความหมาย |
|--------|------|---------|
| `GET/POST` | `/api/clubs` | รายการ/สร้างก๊วน |
| `GET/PATCH/DELETE` | `/api/clubs/[id]` | จัดการก๊วน |
| `GET/POST` | `/api/clubs/[id]/members` | สมาชิกก๊วน |
| `GET/POST` | `/api/venues` | รายการ/สร้างสนาม |
| `GET/PATCH/DELETE` | `/api/venues/[id]` | จัดการสนาม |

### การเงิน

| Method | Path | ความหมาย |
|--------|------|---------|
| `GET` | `/api/finance?period=monthly\|yearly\|all` | สรุปการเงิน |
| `GET/POST` | `/api/payments` | ดู/บันทึกการจ่ายเงิน |

---

## ระบบ Ranking

```
คะแนนที่ได้:
  เข้าร่วมกิจกรรม         +10 pts
  ชนะแมตช์               +15 pts
  แพ้แมตช์               +5 pts
  Streak (3+ ครั้งติด)    +20 pts

Rank Tier (ตามคะแนนสะสม):
  BRONZE    0–199 pts
  SILVER    200–499 pts
  GOLD      500–999 pts
  PLATINUM  1,000–1,999 pts
  DIAMOND   2,000+ pts
```

---

## Protected Routes

Route ต่อไปนี้ต้องล็อกอินก่อนเข้าถึง (กำหนดใน `src/middleware.ts`):

```
/admin/*   /finance/*   /profile/*
/sessions/*   /venues/*   /clubs/*   /players/*
```

---

## Pages

| URL | Component | ประเภท | ความหมาย |
|-----|-----------|--------|---------|
| `/` | `app/page.tsx` | Server | หน้าแรก + Top 5 |
| `/login` | `app/login/page.tsx` | Client | Login (phone/LINE) |
| `/rankings` | `app/rankings/page.tsx` | Server | อันดับผู้เล่น |
| `/sessions` | `app/sessions/page.tsx` | Server | รายการกิจกรรม |
| `/sessions/new` | `app/sessions/new/page.tsx` | Client | สร้างกิจกรรม |
| `/sessions/[id]` | `app/sessions/[id]/page.tsx` | Client | จัดการกิจกรรม |
| `/sessions/[id]/live` | `app/sessions/[id]/live/page.tsx` | Client | Live dashboard (SSE) |
| `/players/[id]` | `app/players/[id]/page.tsx` | Server | โปรไฟล์ผู้เล่น |
| `/finance` | `app/finance/page.tsx` | Server | สรุปการเงิน |
| `/venues` | `app/venues/page.tsx` | Server | รายการสนาม |
| `/clubs/[id]` | `app/clubs/[id]/page.tsx` | Server | หน้าก๊วน |
| `/join/[token]` | `app/join/[token]/page.tsx` | Client | Guest join |
| `/profile` | `app/profile/page.tsx` | Client | โปรไฟล์ตัวเอง |
| `/admin` | `app/admin/page.tsx` | Server | Admin panel |

---

## Tests

```bash
npm test                  # รันทั้งหมด (186 tests / 14 files)
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

| Test file | ครอบคลุม |
|-----------|---------|
| `lib/__tests__/ranking.test.ts` | คำนวณคะแนน, tier, streak bonus |
| `lib/__tests__/matchmaking.test.ts` | Random + Skill-based matching |
| `lib/__tests__/achievements.test.ts` | เงื่อนไข achievement ทุกแบบ |
| `lib/__tests__/recurring.test.ts` | สร้าง session ซ้ำอัตโนมัติ |
| `lib/__tests__/utils.test.ts` | formatCurrency, formatDuration |
| `api/__tests__/sessions-*.test.ts` | API: checkin, complete, join, recurring, share-token |
| `api/__tests__/matches-result.test.ts` | API: บันทึกผลและ rank update |
| `api/__tests__/queue-call.test.ts` | API: เรียกคิว |
| `api/__tests__/rankings.test.ts` | API: leaderboard |
| `api/__tests__/payments.test.ts` | API: การจ่ายเงิน |

---

## การติดตั้งและรัน

ดูรายละเอียดได้ที่ **[SETUP.md](./SETUP.md)**

**TL;DR:**
```bash
# 1. Clone และติดตั้ง
git clone <repo-url> && cd bat-game && npm install

# 2. ตั้งค่า .env
cp .env.example .env   # แก้ DATABASE_URL + NEXTAUTH_SECRET

# 3. สร้าง DB และ seed
npm run db:migrate && npm run db:seed

# 4. รัน
npm run dev            # http://localhost:3000
```

**Login ทดสอบ:** phone `0800000001` / name `สมชาย (Admin)`
