"use client";

import { useState } from "react";

const CLUB = {
  id: "1",
  name: "ก๊วนแบดมินตันสุขุมวิท",
  description: "ก๊วนแบดมินตันเพื่อสุขภาพ เล่นทุกอังคาร-พฤหัส",
  inviteCode: "BAD2024X",
  memberCount: 28,
};

const MEMBERS = [
  { id: "1", name: "สมชาย", rankTier: "DIAMOND", role: "OWNER", totalSessions: 45 },
  { id: "2", name: "สมหญิง", rankTier: "PLATINUM", role: "ADMIN", totalSessions: 40 },
  { id: "3", name: "วิชัย", rankTier: "PLATINUM", role: "MEMBER", totalSessions: 38 },
  { id: "4", name: "พรทิพย์", rankTier: "GOLD", role: "MEMBER", totalSessions: 30 },
];

const RANK_BADGE: Record<string, string> = {
  DIAMOND: "badge-diamond",
  PLATINUM: "badge-platinum",
  GOLD: "badge-gold",
  SILVER: "badge-silver",
  BRONZE: "badge-bronze",
};

const ROLE_LABEL: Record<string, string> = {
  OWNER: "เจ้าของ",
  ADMIN: "แอดมิน",
  MEMBER: "สมาชิก",
};

export default function ClubPage() {
  const [activeTab, setActiveTab] = useState<"members" | "sessions" | "settings">("members");
  const [copiedInvite, setCopiedInvite] = useState(false);

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join-club/${CLUB.inviteCode}`);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Club Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{CLUB.name}</h1>
            <p className="text-gray-600 text-sm mb-3">{CLUB.description}</p>
            <span className="text-sm text-gray-500">👥 {CLUB.memberCount} สมาชิก</span>
          </div>
          <button onClick={copyInvite} className="btn-secondary text-sm">
            {copiedInvite ? "✓ คัดลอกแล้ว" : "📋 คัดลอกลิงก์เชิญ"}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">รหัสเชิญ:</span>
          <code className="font-mono font-bold text-primary-600">{CLUB.inviteCode}</code>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: "members", label: "สมาชิก" },
          { key: "sessions", label: "กิจกรรม" },
          { key: "settings", label: "ตั้งค่า" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">สมาชิก ({MEMBERS.length})</h2>
            <button className="btn-primary text-sm">+ เพิ่มสมาชิก</button>
          </div>
          <div className="space-y-3">
            {MEMBERS.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                    {member.name[0]}
                  </div>
                  <div>
                    <a href={`/players/${member.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                      {member.name}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge text-xs ${RANK_BADGE[member.rankTier]}`}>{member.rankTier}</span>
                      <span className="text-xs text-gray-500">{ROLE_LABEL[member.role]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{member.totalSessions} ครั้ง</span>
                  {member.role !== "OWNER" && (
                    <button className="text-xs text-red-500 hover:text-red-700">ลบ</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">ตั้งค่าก๊วน</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อก๊วน</label>
            <input type="text" className="input w-full" defaultValue={CLUB.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea className="input w-full" rows={3} defaultValue={CLUB.description} />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary">บันทึก</button>
            <button className="btn-secondary">รีเซ็ตรหัสเชิญ</button>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button className="btn-danger text-sm">ลบก๊วน</button>
          </div>
        </div>
      )}
    </div>
  );
}
