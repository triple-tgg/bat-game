# ระบบจัดการก๊วนแบดมินตัน (Badminton Club Management System)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (LINE Login + Credentials) |
| Realtime | Server-Sent Events (SSE) for live court view |
| Deployment | Docker / Vercel |

---

## ฟีเจอร์ทั้งหมด

### 1. ระบบผู้เล่น (Player Management)
- ลงทะเบียนผู้เล่น (ชื่อ, เบอร์โทร, LINE ID, ระดับฝีมือเริ่มต้น)
- Login ผ่าน LINE (LINE Login API via NextAuth)
- ผู้เล่นที่ไม่ได้เป็นสมาชิกสามารถลงชื่อเข้าร่วมผ่านลิงก์ได้ (Guest join via share link)
- โปรไฟล์ผู้เล่น: สถิติ, แร้งค์, ประวัติการเล่น

### 2. ระบบแร้งค์ (Ranking System)
- **คะแนนจากการเข้าร่วม**: +10 คะแนน/กิจกรรม
- **คะแนนจากผลการแข่ง**: ชนะ +15, แพ้ +5 (ELO-inspired)
- **Bonus**: เข้าร่วมติดต่อกัน 3 ครั้ง +20 (streak bonus)
- **Leaderboard**: Top 10 แสดงหน้าหลัก
- **Rank Tiers**: Bronze → Silver → Gold → Platinum → Diamond
- คำนวณจาก: คะแนนสะสม + อัตราชนะ + ความถี่เข้าร่วม

### 3. ระบบกิจกรรม (Session/Event Management)
- สร้างกิจกรรม: วันที่, เวลา, สนาม, จำนวนคอร์ท, ค่าใช้จ่าย
- จัดตารางล่วงหน้า (Recurring sessions: ทุกสัปดาห์/ทุกเดือน)
- ส่งลิงก์ให้ผู้เล่นลงชื่อ (Share link - ไม่ต้อง login)
- กำหนดจำนวนผู้เล่นสูงสุด + Waitlist
- สถานะ: Draft → Open → Full → In Progress → Completed

### 4. ระบบเช็คอิน & คิว (Check-in & Queue)
- เช็คอินเมื่อถึงสนาม (QR Code / กดปุ่ม)
- ระบบคิวอัตโนมัติ: FIFO + นับเวลารอ
- แสดงเวลารอคิวของแต่ละคน (real-time)
- นับรอบการเล่นของแต่ละคน
- เมื่อจบรอบ → ผู้เล่นกลับไปท้ายคิว
- Priority queue option: คนที่รอนานสุดได้เล่นก่อน

### 5. ระบบสุ่มผู้เล่น & จัดคู่ (Matchmaking)
- สุ่มจัดคู่จากคิว (Random)
- จัดคู่ตามระดับฝีมือ (Skill-based matching)
- รองรับ: เดี่ยว (1v1) และ คู่ (2v2)
- ป้องกันการจัดคู่ซ้ำติดกัน
- ผู้จัดสามารถ override สุ่มได้

### 6. ระบบสนาม (Court Management)
- เพิ่ม/แก้ไข/ลบสนาม
- กำหนดจำนวนคอร์ท
- สถานะคอร์ท: Available / In Use / Maintenance
- ค่าเช่าสนาม/ชั่วโมง
- ประวัติการใช้สนาม

### 7. ระบบการเงิน & บัญชี (Financial Management)
- คิดค่าใช้จ่ายต่อคน/กิจกรรม (หารเท่า หรือ custom)
- ค่าสนาม + ค่าลูกขนไก่ = ค่าใช้จ่ายรวม
- บันทึกรายรับ-รายจ่าย
- สถานะการจ่ายเงิน: Unpaid / Paid / Partial
- สรุปยอดรายวัน/รายเดือน
- นับจำนวนลูกขนไก่ที่ใช้/กิจกรรม

### 8. ระบบบันทึกการแข่ง (Match Recording)
- บันทึกผลแข่ง: คะแนน, ผู้เล่น, คอร์ท, เวลา
- สถิติส่วนตัว: ชนะ/แพ้, คู่ที่ดีที่สุด, คู่ต่อสู้ที่เจอบ่อย
- ดูรอบการเล่นตัวเอง (My Matches)
- ประวัติย้อนหลัง

### 9. Live Dashboard (ภาพรวมสนาม)
- แสดงสถานะทุกคอร์ทแบบ real-time
- ใครกำลังเล่นอยู่คอร์ทไหน
- คิวรอ + เวลารอ
- คะแนนปัจจุบัน (ถ้าบันทึก)
- แสดงบน TV/จอใหญ่ได้ (Full-screen mode)

### 10. ระบบแจ้งเตือน (Notifications)
- แจ้งเตือนถึงคิวเล่น (LINE Notify / in-app)
- แจ้งเตือนกิจกรรมที่กำลังจะมาถึง
- แจ้งเตือนค่าใช้จ่ายค้างจ่าย
- สรุปผลหลังจบกิจกรรม

### 11. ฟีเจอร์เสริมที่แนะนำ
- **ระบบ Achievement/Badge**: เล่นครบ 10 ครั้ง, ชนะ 5 ติด, MVP ฯลฯ
- **ระบบ Challenge**: ท้าเล่นกันระหว่างผู้เล่น
- **สถิติขั้นสูง**: Win rate ตาม partner, ตาม opponent, ตามสนาม
- **Photo Gallery**: อัพโหลดรูปกิจกรรม
- **ระบบ Vote**: โหวตวันเล่น, โหวตสนาม
- **Export**: ส่งออกข้อมูลเป็น Excel/PDF
- **Multi-club**: รองรับหลายก๊วน

---

## Database Schema (Overview)

```
User (ผู้ใช้)
├── id, name, phone, lineId, avatarUrl
├── role: ADMIN | MEMBER | GUEST
├── rankPoints, rankTier
└── createdAt, updatedAt

Club (ก๊วน)
├── id, name, description, inviteCode
├── ownerId → User
└── createdAt

ClubMember (สมาชิกก๊วน)
├── clubId → Club
├── userId → User
└── role: OWNER | ADMIN | MEMBER

Venue (สนาม)
├── id, name, address, courtsCount
├── pricePerHour, contactInfo
└── clubId → Club

Session (กิจกรรม)
├── id, title, date, startTime, endTime
├── venueId → Venue, clubId → Club
├── maxPlayers, costPerPerson
├── shuttlecockUsed, shuttlecockCost
├── status: DRAFT | OPEN | FULL | IN_PROGRESS | COMPLETED
└── shareToken (สำหรับ share link)

SessionPlayer (ผู้เล่นในกิจกรรม)
├── sessionId → Session, userId → User
├── guestName (สำหรับ guest)
├── status: REGISTERED | CHECKED_IN | PLAYING | WAITING | LEFT
├── checkinAt, queuePosition
├── roundsPlayed, waitTime
└── paymentStatus: UNPAID | PAID

Match (รอบการแข่ง)
├── id, sessionId → Session, courtNumber
├── startTime, endTime
├── team1Score, team2Score
├── status: IN_PROGRESS | COMPLETED | CANCELLED
└── matchType: SINGLES | DOUBLES

MatchPlayer (ผู้เล่นในรอบ)
├── matchId → Match, userId → User
├── team: 1 | 2
└── isWinner

QueueEntry (คิว)
├── id, sessionId → Session, userId → User
├── joinedAt, estimatedWait
├── position, status: WAITING | CALLED | SKIPPED
└── waitDurationSeconds

RankHistory (ประวัติแร้งค์)
├── userId → User, points, reason
├── sessionId → Session
└── createdAt

Payment (การเงิน)
├── id, sessionId → Session, userId → User
├── amount, method, paidAt
└── status: PENDING | PAID | REFUNDED

Expense (รายจ่าย)
├── id, sessionId → Session
├── category: COURT | SHUTTLECOCK | OTHER
├── amount, description
└── createdAt

Achievement (เหรียญ)
├── id, name, description, iconUrl
├── condition (JSON)
└── userId → User, earnedAt
```

---

## API Routes Structure

```
/api/auth/[...nextauth]     - Authentication (LINE + Credentials)
/api/clubs/                  - CRUD clubs
/api/clubs/[id]/members      - Club members management
/api/clubs/[id]/invite       - Generate/validate invite link
/api/venues/                 - CRUD venues
/api/sessions/               - CRUD sessions
/api/sessions/[id]/join      - Join session (member or guest)
/api/sessions/[id]/checkin   - Check-in
/api/sessions/[id]/queue     - Queue management
/api/sessions/[id]/matches   - Match management
/api/sessions/[id]/matchmake - Auto matchmaking
/api/sessions/[id]/live      - SSE live dashboard
/api/sessions/[id]/expenses  - Session expenses
/api/players/[id]/stats      - Player statistics
/api/players/[id]/matches    - Player match history
/api/rankings/               - Leaderboard
/api/payments/               - Payment management
/api/finance/summary         - Financial summary
```

---

## Frontend Pages

```
/                           - Landing + Leaderboard Top 10
/login                      - Login (LINE / Guest)
/join/[token]               - Guest join via share link
/dashboard                  - Admin dashboard
/clubs/[id]                 - Club home
/sessions                   - Sessions list + calendar
/sessions/[id]              - Session detail + check-in + queue
/sessions/[id]/live         - Live court view (TV mode)
/sessions/[id]/matchmake    - Matchmaking control
/sessions/new               - Create session
/players/[id]               - Player profile + stats
/rankings                   - Full leaderboard
/finance                    - Financial management
/venues                     - Venue management
/settings                   - Club settings
```

---

## Key Flows

### Flow 1: สร้างกิจกรรม & ส่งลิงก์
1. Admin สร้าง Session → ระบุสนาม, วัน, เวลา, ค่าใช้จ่าย
2. ระบบสร้าง Share Link → `/join/abc123`
3. ส่งลิงก์ให้ผู้เล่นทาง LINE
4. ผู้เล่นกดลิงก์ → กรอกชื่อ → ลงชื่อสำเร็จ (ไม่ต้อง login)
5. สมาชิกที่ login แล้ว → กดลงชื่อได้เลย

### Flow 2: วันเล่นจริง
1. ผู้เล่นมาถึง → Check-in (QR / กดปุ่ม)
2. เข้าคิวอัตโนมัติ
3. ระบบสุ่มจัดคู่ → ส่งเข้าคอร์ท
4. เล่นจบ → บันทึกผล → กลับคิว
5. Dashboard แสดงสถานะ real-time

### Flow 3: จบกิจกรรม
1. Admin กด "จบกิจกรรม"
2. ระบบคำนวณค่าใช้จ่าย (สนาม + ลูก ÷ จำนวนคน)
3. อัพเดทแร้งค์ทุกคน
4. สรุปผล → ส่งแจ้งเตือน
