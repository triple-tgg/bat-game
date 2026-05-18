"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const RANK_BADGE: Record<string, string> = {
  DIAMOND: "badge-diamond", PLATINUM: "badge-platinum",
  GOLD: "badge-gold", SILVER: "badge-silver", BRONZE: "badge-bronze",
};

interface PlayerData {
  id: string; name: string; phone: string | null; avatarUrl: string | null;
  rankTier: string; rankPoints: number;
  totalSessions: number; totalWins: number; totalLosses: number; streak: number;
  achievements: { achievement: { name: string; description: string; iconUrl: string | null } }[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [player, setPlayer]     = useState<PlayerData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/players/${session.user.id}/stats`)
      .then((r) => r.json())
      .then((data) => {
        setPlayer(data.player);
        setForm({ name: data.player.name, phone: data.player.phone ?? "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  async function handleSave() {
    if (!session?.user?.id || !form.name.trim()) return;
    setSaving(true);
    setSaveError("");
    const res = await fetch(`/api/players/${session.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error ?? "บันทึกไม่สำเร็จ");
    } else {
      const updated = await res.json();
      setPlayer((p) => p ? { ...p, name: updated.name, phone: updated.phone } : p);
      setEditing(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="card text-center py-12 text-gray-500">ไม่พบข้อมูลผู้เล่น</div>
      </div>
    );
  }

  const winRate = (player.totalWins + player.totalLosses) > 0
    ? Math.round((player.totalWins / (player.totalWins + player.totalLosses)) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl shrink-0">
            {player.avatarUrl
              ? <img src={player.avatarUrl} alt={player.name} className="h-full w-full rounded-full object-cover" />
              : "🏸"}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                {saveError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{saveError}</div>
                )}
                <input className="input w-full" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อ" />
                <input className="input w-full" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="เบอร์โทร" />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                    {saving ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                  <button onClick={() => { setEditing(false); setSaveError(""); }} className="btn-secondary text-sm">ยกเลิก</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
                  <button onClick={() => setEditing(true)} className="text-sm text-gray-400 hover:text-gray-600">✏️ แก้ไข</button>
                </div>
                {player.phone && <p className="text-gray-500 text-sm">{player.phone}</p>}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`badge ${RANK_BADGE[player.rankTier] ?? "badge-bronze"}`}>{player.rankTier}</span>
                  <span className="font-mono font-bold text-primary-600">{player.rankPoints.toLocaleString()} pts</span>
                  {player.streak > 0 && <span className="text-orange-500 font-medium text-sm">🔥 {player.streak} streak</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "กิจกรรม", value: player.totalSessions, color: "text-primary-600" },
          { label: "ชนะ",     value: player.totalWins,     color: "text-green-600" },
          { label: "แพ้",     value: player.totalLosses,   color: "text-red-600" },
          { label: "Win%",    value: `${winRate}%`,         color: "text-primary-600" },
        ].map((s) => (
          <div key={s.label} className="card text-center py-3">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {player.achievements.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">🎖️ Achievement ({player.achievements.length})</h2>
          <div className="flex flex-wrap gap-3">
            {player.achievements.map((ua, i) => (
              <div key={i} title={ua.achievement.description}
                className="flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-sm">
                <span>{ua.achievement.iconUrl ?? "🏅"}</span>
                <span className="font-medium text-yellow-800">{ua.achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="space-y-1">
          <a href={`/players/${player.id}`} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">📊 ดูสถิติการแข่งขัน</span>
            <span className="text-gray-400">→</span>
          </a>
          <a href="/sessions" className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">📅 กิจกรรมทั้งหมด</span>
            <span className="text-gray-400">→</span>
          </a>
          {session?.user?.role === "ADMIN" && (
            <a href="/admin" className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-primary-600">⚙️ Admin Dashboard</span>
              <span className="text-gray-400">→</span>
            </a>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-sm text-red-500 hover:text-red-700 font-medium py-2">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
