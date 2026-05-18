"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const RANK_BADGE: Record<string, string> = {
  DIAMOND: "badge-diamond", PLATINUM: "badge-platinum",
  GOLD: "badge-gold", SILVER: "badge-silver", BRONZE: "badge-bronze",
};

const ROLE_LABEL: Record<string, string> = {
  OWNER: "เจ้าของ", ADMIN: "แอดมิน", MEMBER: "สมาชิก",
};

interface ClubMember {
  id: string; role: string;
  user: { id: string; name: string; avatarUrl: string | null; rankTier: string; rankPoints: number };
}
interface Venue { id: string; name: string; courtsCount: number }
interface ClubData {
  id: string; name: string; description: string | null; inviteCode: string;
  owner: { id: string; name: string };
  members: ClubMember[];
  venues: Venue[];
  _count: { sessions: number };
}

export default function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [club, setClub]       = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "venues" | "settings">("members");
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [settingsForm, setSettingsForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetch(`/api/clubs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setClub(data);
        setSettingsForm({ name: data.name, description: data.description ?? "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function copyInvite() {
    if (!club) return;
    navigator.clipboard.writeText(`${window.location.origin}/join-club/${club.inviteCode}`);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsForm.name.trim()) return;
    setSaving(true); setSaveError("");
    const res = await fetch(`/api/clubs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: settingsForm.name, description: settingsForm.description }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error ?? "บันทึกไม่สำเร็จ");
    } else {
      const updated = await res.json();
      setClub((c) => c ? { ...c, name: updated.name, description: updated.description } : c);
    }
  }

  async function handleRegenerateInvite() {
    if (!confirm("รีเซ็ตรหัสเชิญ? รหัสเดิมจะใช้งานไม่ได้")) return;
    const res = await fetch(`/api/clubs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateInvite: true }),
    });
    if (res.ok) {
      const updated = await res.json();
      setClub((c) => c ? { ...c, inviteCode: updated.inviteCode } : c);
    }
  }

  async function handleDeleteClub() {
    if (!confirm("ลบก๊วนนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้")) return;
    const res = await fetch(`/api/clubs/${id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json();
      alert(data.error ?? "ลบไม่สำเร็จ");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-60 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="card text-center py-12 text-gray-500">ไม่พบก๊วน</div>
      </div>
    );
  }

  const isOwnerOrAdmin = club.members.some(
    (m) => m.user.id === session?.user?.id && (m.role === "OWNER" || m.role === "ADMIN")
  ) || session?.user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{club.name}</h1>
            {club.description && <p className="text-gray-600 text-sm mb-3">{club.description}</p>}
            <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
              <span>👥 {club.members.length} สมาชิก</span>
              <span>🏟️ {club.venues.length} สนาม</span>
              <span>📅 {club._count.sessions} กิจกรรม</span>
            </div>
          </div>
          <button onClick={copyInvite} className="btn-secondary text-sm shrink-0">
            {copiedInvite ? "✓ คัดลอกแล้ว" : "📋 คัดลอกลิงก์เชิญ"}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">รหัสเชิญ:</span>
          <code className="font-mono font-bold text-primary-600">{club.inviteCode}</code>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {([
          { key: "members", label: "สมาชิก" },
          { key: "venues",  label: "สนาม" },
          { key: "settings", label: "ตั้งค่า" },
        ] as const).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">สมาชิก ({club.members.length})</h2>
          <div className="space-y-3">
            {club.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                    {member.user.avatarUrl
                      ? <img src={member.user.avatarUrl} alt={member.user.name} className="h-full w-full rounded-full object-cover" />
                      : member.user.name[0]}
                  </div>
                  <div>
                    <a href={`/players/${member.user.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                      {member.user.name}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge text-xs ${RANK_BADGE[member.user.rankTier] ?? "badge-bronze"}`}>
                        {member.user.rankTier}
                      </span>
                      <span className="text-xs text-gray-500">{ROLE_LABEL[member.role] ?? member.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-mono">{member.user.rankPoints.toLocaleString()} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "venues" && (
        <div className="space-y-4">
          {club.venues.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">ยังไม่มีสนาม</div>
          ) : club.venues.map((venue) => (
            <div key={venue.id} className="card">
              <a href={`/venues`} className="font-semibold text-gray-900 hover:text-primary-600">{venue.name}</a>
              <p className="text-sm text-gray-500 mt-1">🏸 {venue.courtsCount} คอร์ท</p>
            </div>
          ))}
          {isOwnerOrAdmin && (
            <a href="/venues" className="btn-secondary block text-center">+ จัดการสนาม</a>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">ตั้งค่าก๊วน</h2>
          {saveError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{saveError}</div>
          )}
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อก๊วน</label>
              <input type="text" required className="input w-full" value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea className="input w-full" rows={3} value={settingsForm.description}
                onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button type="button" onClick={handleRegenerateInvite} className="btn-secondary">รีเซ็ตรหัสเชิญ</button>
            </div>
          </form>
          {isOwnerOrAdmin && (
            <div className="pt-4 border-t border-gray-200">
              <button onClick={handleDeleteClub} className="text-sm text-red-500 hover:text-red-700 font-medium">ลบก๊วน</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
