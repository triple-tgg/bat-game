# คู่มือติดตั้งและรัน BadmintonHub บน Local

## สิ่งที่ต้องมีก่อน

| เครื่องมือ | เวอร์ชันขั้นต่ำ | ดาวน์โหลด |
|-----------|---------------|-----------|
| Node.js | 18.x ขึ้นไป | https://nodejs.org |
| npm | 9.x ขึ้นไป | มากับ Node.js |
| PostgreSQL | 14.x ขึ้นไป | https://www.postgresql.org/download |
| Git | ใดก็ได้ | https://git-scm.com |

ตรวจสอบเวอร์ชันที่ติดตั้ง:

```bash
node -v
npm -v
psql --version
git --version
```

---

## ขั้นตอนที่ 1 — Clone โปรเจกต์

```bash
git clone <repository-url>
cd bat-game
```

---

## ขั้นตอนที่ 2 — ติดตั้ง Dependencies

```bash
npm install
```

---

## ขั้นตอนที่ 3 — สร้างฐานข้อมูล PostgreSQL

เปิด psql หรือ pgAdmin แล้วสร้าง database:

```sql
CREATE DATABASE batgame;
```

หรือรันผ่าน terminal:

```bash
createdb batgame
```

---

## ขั้นตอนที่ 4 — ตั้งค่า Environment Variables

คัดลอกไฟล์ตัวอย่าง:

```bash
cp .env.example .env
```

แก้ไข `.env` ให้ตรงกับเครื่องของคุณ:

```env
# ฐานข้อมูล — เปลี่ยน user/password ให้ตรงกับ PostgreSQL ของคุณ
DATABASE_URL="postgresql://postgres:password@localhost:5432/batgame?schema=public"

# URL ของแอป (ใช้ค่าเดิมสำหรับ local)
NEXTAUTH_URL="http://localhost:3000"

# Secret สำหรับ NextAuth — ใส่ค่าสุ่มอะไรก็ได้
NEXTAUTH_SECRET="my-local-secret-key-change-this"

# LINE Login (ไม่บังคับ — ถ้าไม่มีก็ข้ามได้ ใช้ login แบบ phone แทน)
LINE_CHANNEL_ID=""
LINE_CHANNEL_SECRET=""

# LINE Notify (ไม่บังคับ)
LINE_NOTIFY_TOKEN=""
```

> **สร้าง NEXTAUTH_SECRET แบบสุ่ม:**
> ```bash
> openssl rand -base64 32
> ```

---

## ขั้นตอนที่ 5 — Migrate ฐานข้อมูล

```bash
npm run db:migrate
```

คำสั่งนี้จะสร้าง schema ทั้งหมดใน PostgreSQL และ generate Prisma Client ให้อัตโนมัติ

> **หากใช้ครั้งแรกและไม่ต้องการ migration history** สามารถใช้ `db push` แทน:
> ```bash
> npm run db:push
> ```

---

## ขั้นตอนที่ 6 — ใส่ข้อมูลตัวอย่าง (Seed)

```bash
npm run db:seed
```

จะสร้างข้อมูลสาธิตดังนี้:

| ชื่อ | เบอร์โทร (ใช้ login) | แร้งค์ |
|------|---------------------|--------|
| สมชาย (Admin) | 0800000001 | DIAMOND |
| สมหญิง | 0800000002 | PLATINUM |
| วิชัย | 0800000003 | PLATINUM |
| พรทิพย์ | 0800000004 | PLATINUM |
| อดิศร | 0800000005 | GOLD |
| มานะ | 0800000006 | GOLD |
| ปิยะ | 0800000007 | GOLD |
| นภา | 0800000008 | SILVER |
| ธนา | 0800000009 | SILVER |
| สุดา | 0800000010 | BRONZE |

รวมถึงก๊วน (**ก๊วนแบดมินตันสุขุมวิท**) สนาม (**สนามแบดมินตัน A** — 4 คอร์ท) และ Achievements พื้นฐาน

---

## ขั้นตอนที่ 7 — รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ **http://localhost:3000**

---

## วิธี Login เข้าระบบ

ไปที่ http://localhost:3000/login แล้วใส่:

- **Phone:** `0800000001` (หรือเบอร์อื่นจากตารางด้านบน)
- **Name:** ชื่อของ account นั้น เช่น `สมชาย (Admin)`

> ระบบใช้ **Credentials Provider** — ไม่ต้องมีรหัสผ่าน แค่ phone + name ตรงกันก็ login ได้

---

## คำสั่งอื่น ๆ ที่มีประโยชน์

```bash
# รัน test ทั้งหมด
npm test

# รัน test แบบ watch mode
npm run test:watch

# ดู test coverage
npm run test:coverage

# เปิด Prisma Studio (GUI ดูฐานข้อมูล)
npm run db:studio

# Build สำหรับ production
npm run build

# รัน production build
npm start
```

---

## โครงสร้างหน้าหลัก

| URL | หน้า |
|-----|------|
| `/` | หน้าแรก + Top 5 อันดับ |
| `/sessions` | รายการกิจกรรม |
| `/sessions/new` | สร้างกิจกรรมใหม่ |
| `/sessions/[id]` | จัดการกิจกรรม (คิว, สนาม, ผล, ค่าใช้จ่าย) |
| `/rankings` | อันดับผู้เล่นทั้งหมด |
| `/players/[id]` | โปรไฟล์ผู้เล่น |
| `/finance` | สรุปการเงิน (monthly/yearly/all) |
| `/login` | หน้า Login |

---

## แก้ปัญหาที่พบบ่อย

**`Error: DATABASE_URL is not set`**
→ ตรวจสอบว่าสร้างไฟล์ `.env` แล้ว และค่า `DATABASE_URL` ถูกต้อง

**`Error: connect ECONNREFUSED 127.0.0.1:5432`**
→ PostgreSQL ยังไม่ได้รัน ให้เปิด service ก่อน:
```bash
# macOS (Homebrew)
brew services start postgresql@14

# Ubuntu/Debian
sudo service postgresql start

# Windows
# เปิด Services แล้ว Start "postgresql-x64-14"
```

**`PrismaClientKnownRequestError: relation does not exist`**
→ ยังไม่ได้ migrate ให้รัน `npm run db:migrate` หรือ `npm run db:push`

**`Error: NEXTAUTH_SECRET is not set`**
→ ใส่ค่าใด ๆ ใน `NEXTAUTH_SECRET` ใน `.env`

**Port 3000 ถูกใช้งานอยู่**
→ ระบุ port อื่น:
```bash
npm run dev -- -p 3001
```
แล้วอัปเดต `NEXTAUTH_URL="http://localhost:3001"` ใน `.env` ด้วย
