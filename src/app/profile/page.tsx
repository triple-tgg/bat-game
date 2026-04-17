"use client";

import { useState } from "react";

const PLAYER = {
  id: "me",
  name: "สมชาย",
  phone: "0812345678",
  email: "",
  rankTier: "DIAMOND",
  rankPoints: 2150,
  totalSessions: 45,
  totalWins: 89,
  totalLosses: 21,
  streak: 8,
};

const ACHIEVEMENTS = [
  { icon: "🏸", name: "มือใหม่", description: "เข้าร่วมกิจกรรมครั้งแรก", earned: true, date: "2025-01-10" },
  { icon: "⭐", name: "สมาชิกประจำ", description: "เข้าร่วม 10 ครั้ง", earned: true, date: "2025-02-15" },
  { icon: "🔥", name: "Streak 3", description: "เข้าร่วมติดต่อ 3 ครั้ง", earned: true, date: "2025-03-01" },
  { icon: "🏆", name: "นักรบแบดมินตัน", description: "เข้าร่วม 50 ครั้ง", earned: false, date: null },
  { icon: "👑", name: "ผู้ชนะ", description: "ชนะ 50 ครั้ง", earned: true, date: "2025-03-10" },
  { icon: "🦅", name: "MVP", description: "Win rate 70%+", earned: true, date: "2025-03-18" },
];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: PLAYER.name, phone: PLAYER.phone });

  const winRate = Math.round((PLAYER.totalWins / (PLAYER.totalWins + PLAYER.totalLosses)) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl">
            🏸
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  className="input w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ชื่อ"
                />
                <input
                  className="input w-full"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="เบอร์โทร"
                />
                <div className="flex gap-2">
                  <button className="btn-primary text-sm" onClick={() => setEditing(false)}>
                    บันทึก
                  </button>
                  <button className="btn-secondary text-sm" onClick={() => setEditing(false)}>
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{PLAYER.name}</h1>
                  <button onClick={() => setEditing(true)} className="text-sm text-gray-500 hover:text-gray-700">
                    ✏️ แก้ไข
                  </button>
                </div>
                <p className="text-gray-500 text-sm">{PLAYER.phone}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="badge badge-diamond">DIAMOND</span>
                  <span className="font-mono font-bold text-primary-600">
                    {PLAYER.rankPoints.toLocaleString()} pts
                  </span>
                  {PLAYER.streak > 0 && (
                    <span className="text-orange-500 font-medium text-sm">🔥 {PLAYER.streak} streak</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "กิจกรรม", value: PLAYER.totalSessions, color: "text-primary-600" },
          { label: "ชนะ", value: PLAYER.totalWins, color: "text-green-600" },
          { label: "แพ้", value: PLAYER.totalLosses, color: "text-red-600" },
          { label: "Win%", value: `${winRate}%`, color: "text-primary-600" },
        ].map((s) => (
          <div key={s.label} className="card text-center py-3">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">
          🎖️ Achievement ({ACHIEVEMENTS.filter((a) => a.earned).length}/{ACHIEVEMENTS.length})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.name}
              className={`flex items-center gap-3 rounded-lg p-3 border ${
                a.earned
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-100 bg-gray-50 opacity-50"
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <div>
                <div className={`text-sm font-medium ${a.earned ? "text-gray-900" : "text-gray-400"}`}>
                  {a.name}
                </div>
                <div className="text-xs text-gray-500">{a.description}</div>
                {a.earned && a.date && (
                  <div className="text-xs text-yellow-600">{a.date}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
