"use client";

import { useState } from "react";

const MOCK_VENUES = [
  {
    id: "1",
    name: "สนามแบดมินตัน A",
    address: "123 ถนนสุขุมวิท กรุงเทพ",
    courtsCount: 4,
    pricePerHour: 400,
    contactInfo: "02-123-4567",
    sessionsCount: 24,
  },
  {
    id: "2",
    name: "สนามแบดมินตัน B",
    address: "456 ถนนรัชดา กรุงเทพ",
    courtsCount: 3,
    pricePerHour: 350,
    contactInfo: "02-987-6543",
    sessionsCount: 18,
  },
];

export default function VenuesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    courtsCount: 2,
    pricePerHour: 0,
    contactInfo: "",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🏟️ จัดการสนาม</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + เพิ่มสนาม
        </button>
      </div>

      {/* Add Venue Form */}
      {showForm && (
        <div className="card mb-6 border-2 border-primary-200">
          <h2 className="font-bold text-gray-900 mb-4">เพิ่มสนามใหม่</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสนาม *</label>
              <input
                type="text"
                className="input w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="เช่น สนามแบดมินตัน A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
              <input
                type="text"
                className="input w-full"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="ที่อยู่สนาม"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนคอร์ท</label>
              <input
                type="number"
                className="input w-full"
                value={form.courtsCount}
                onChange={(e) => setForm({ ...form, courtsCount: +e.target.value })}
                min={1}
                max={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค่าเช่า/ชั่วโมง (บาท)</label>
              <input
                type="number"
                className="input w-full"
                value={form.pricePerHour}
                onChange={(e) => setForm({ ...form, pricePerHour: +e.target.value })}
                min={0}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ข้อมูลติดต่อ</label>
              <input
                type="text"
                className="input w-full"
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="เบอร์โทร / LINE"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary">บันทึก</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Venue List */}
      <div className="space-y-4">
        {MOCK_VENUES.map((venue) => (
          <div key={venue.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{venue.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>📍 {venue.address}</span>
                  <span>🏸 {venue.courtsCount} คอร์ท</span>
                  <span>💰 {venue.pricePerHour} บาท/ชม.</span>
                  <span>📞 {venue.contactInfo}</span>
                  <span>📅 ใช้งาน {venue.sessionsCount} ครั้ง</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="btn-secondary text-xs px-3 py-1">แก้ไข</button>
                <button className="btn-danger text-xs px-3 py-1">ลบ</button>
              </div>
            </div>

            {/* Courts */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {Array.from({ length: venue.courtsCount }, (_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-center min-w-[60px]"
                >
                  <div className="font-medium text-gray-700">Court {i + 1}</div>
                  <div className="text-green-600 text-xs mt-0.5">ว่าง</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
