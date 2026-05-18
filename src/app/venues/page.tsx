"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Court { id: string; number: number; name: string }
interface Venue {
  id: string; name: string; address: string | null;
  courtsCount: number; pricePerHour: number; contactInfo: string | null;
  courts: Court[];
  _count: { sessions: number };
}
interface Club { id: string; name: string }

export default function VenuesPage() {
  const { data: session } = useSession();
  const [venues, setVenues]   = useState<Venue[]>([]);
  const [clubs, setClubs]     = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    name: "", address: "", courtsCount: 2, pricePerHour: 0, contactInfo: "", clubId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/venues").then((r) => r.json()),
      fetch("/api/clubs").then((r) => r.json()),
    ]).then(([v, c]) => {
      setVenues(Array.isArray(v) ? v : []);
      setClubs(Array.isArray(c) ? c : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.clubId) { setSaveError("กรุณากรอกชื่อสนามและเลือกก๊วน"); return; }
    setSaving(true); setSaveError("");
    const res = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error ?? "บันทึกไม่สำเร็จ");
    } else {
      const venue = await res.json();
      setVenues((v) => [...v, venue]);
      setShowForm(false);
      setForm({ name: "", address: "", courtsCount: 2, pricePerHour: 0, contactInfo: "", clubId: "" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบสนามนี้?")) return;
    const res = await fetch(`/api/venues/${id}`, { method: "DELETE" });
    if (res.ok) setVenues((v) => v.filter((x) => x.id !== id));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          {[...Array(2)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🏟️ จัดการสนาม</h1>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ เพิ่มสนาม</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 border-2 border-primary-200">
          <h2 className="font-bold text-gray-900 mb-4">เพิ่มสนามใหม่</h2>
          {saveError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">{saveError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสนาม *</label>
              <input type="text" required className="input w-full" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สนามแบดมินตัน A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ก๊วน *</label>
              <select required className="input w-full" value={form.clubId}
                onChange={(e) => setForm({ ...form, clubId: e.target.value })}>
                <option value="">เลือกก๊วน</option>
                {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
              <input type="text" className="input w-full" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="ที่อยู่สนาม" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ข้อมูลติดต่อ</label>
              <input type="text" className="input w-full" value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} placeholder="เบอร์โทร / LINE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนคอร์ท</label>
              <input type="number" className="input w-full" value={form.courtsCount} min={1} max={20}
                onChange={(e) => setForm({ ...form, courtsCount: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค่าเช่า/ชั่วโมง (บาท)</label>
              <input type="number" className="input w-full" value={form.pricePerHour} min={0}
                onChange={(e) => setForm({ ...form, pricePerHour: +e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setSaveError(""); }} className="btn-secondary">ยกเลิก</button>
          </div>
        </form>
      )}

      {venues.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">ยังไม่มีสนาม</div>
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => (
            <div key={venue.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{venue.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {venue.address && <span>📍 {venue.address}</span>}
                    <span>🏸 {venue.courtsCount} คอร์ท</span>
                    {venue.pricePerHour > 0 && <span>💰 {venue.pricePerHour} บาท/ชม.</span>}
                    {venue.contactInfo && <span>📞 {venue.contactInfo}</span>}
                    <span>📅 ใช้งาน {venue._count.sessions} ครั้ง</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleDelete(venue.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg">ลบ</button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                {venue.courts.map((court) => (
                  <div key={court.id} className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-center min-w-[60px]">
                    <div className="font-medium text-gray-700">{court.name}</div>
                    <div className="text-green-600 text-xs mt-0.5">ว่าง</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
