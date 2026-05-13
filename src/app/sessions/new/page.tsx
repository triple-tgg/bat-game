"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Venue { id: string; name: string; address: string | null; courtsCount: number }
interface Club  { id: string; name: string }

export default function NewSessionPage() {
  const router = useRouter();
  const [venues, setVenues]     = useState<Venue[]>([]);
  const [clubs, setClubs]       = useState<Club[]>([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  const [title, setTitle]               = useState("");
  const [date, setDate]                 = useState("");
  const [startTime, setStartTime]       = useState("");
  const [endTime, setEndTime]           = useState("");
  const [maxPlayers, setMaxPlayers]     = useState(20);
  const [costPerPerson, setCostPerPerson] = useState(0);
  const [venueId, setVenueId]           = useState("");
  const [clubId, setClubId]             = useState("");
  const [isRecurring, setIsRecurring]   = useState(false);
  const [recurringRule, setRecurringRule] = useState("WEEKLY");
  const [notes, setNotes]               = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/venues").then((r) => r.json()),
      fetch("/api/clubs").then((r) => r.json()),
    ])
      .then(([v, c]) => { setVenues(v); setClubs(c); })
      .catch(() => setError("โหลดข้อมูลไม่ได้"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!venueId || !clubId) { setError("กรุณาเลือกสนามและก๊วน"); return; }

    setSubmitting(true);
    setError("");

    const toISO = (d: string, t: string) => new Date(`${d}T${t}:00`).toISOString();

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: toISO(date, startTime),
          startTime: toISO(date, startTime),
          endTime: toISO(date, endTime),
          maxPlayers,
          costPerPerson,
          venueId,
          clubId,
          isRecurring,
          recurringRule: isRecurring ? recurringRule : undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">สร้างกิจกรรม</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม *</label>
          <input
            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            className="input w-full" placeholder="เช่น แบดมินตันวันอังคาร"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ก๊วน *</label>
            <select required value={clubId} onChange={(e) => setClubId(e.target.value)} className="input w-full">
              <option value="">เลือกก๊วน</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สนาม *</label>
            <select required value={venueId} onChange={(e) => setVenueId(e.target.value)} className="input w-full">
              <option value="">เลือกสนาม</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}{v.address ? ` — ${v.address}` : ""}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ *</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม *</label>
            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาจบ *</label>
            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้เล่นสูงสุด</label>
            <input
              type="number" min={2} max={100} value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ค่าใช้จ่ายต่อคน (บาท)</label>
            <input
              type="number" min={0} value={costPerPerson}
              onChange={(e) => setCostPerPerson(Number(e.target.value))}
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">กิจกรรมซ้ำประจำ</span>
          </label>
          {isRecurring && (
            <div className="mt-3">
              <select value={recurringRule} onChange={(e) => setRecurringRule(e.target.value)} className="input w-full">
                <option value="WEEKLY">ทุกสัปดาห์</option>
                <option value="BIWEEKLY">ทุก 2 สัปดาห์</option>
                <option value="MONTHLY">ทุกเดือน</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            className="input w-full" rows={3} placeholder="รายละเอียดเพิ่มเติม..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3">
            {submitting ? "กำลังสร้าง..." : "สร้างกิจกรรม"}
          </button>
          <a href="/sessions" className="btn-secondary flex-1 py-3 text-center">ยกเลิก</a>
        </div>
      </form>
    </div>
  );
}
