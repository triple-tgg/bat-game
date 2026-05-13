"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency, formatDuration } from "@/lib/utils";

const RANK_BADGE: Record<string, string> = {
  DIAMOND: "badge-diamond", PLATINUM: "badge-platinum",
  GOLD: "badge-gold", SILVER: "badge-silver", BRONZE: "badge-bronze",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:       { label: "แบบร่าง",    color: "bg-gray-100 text-gray-800" },
  OPEN:        { label: "เปิดรับ",    color: "bg-green-100 text-green-800" },
  FULL:        { label: "เต็มแล้ว",   color: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "กำลังเล่น", color: "bg-blue-100 text-blue-800" },
  COMPLETED:   { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-600" },
  CANCELLED:   { label: "ยกเลิก",    color: "bg-red-100 text-red-800" },
};

interface SessionPlayer {
  id: string; status: string;
  user: { id: string; name: string; avatarUrl: string | null; rankTier: string };
}

interface Match {
  id: string; courtNumber: number; roundNumber: number;
  team1Score: number; team2Score: number; status: string;
  players: { id: string; team: number; isWinner: boolean; user: { id: string; name: string } }[];
}

interface Expense {
  id: string; category: string; amount: number; description: string | null; createdAt: string;
}

interface Court { id: string; number: number; name: string }

interface SessionData {
  id: string; title: string; date: string; startTime: string; endTime: string;
  status: string; costPerPerson: number; maxPlayers: number; shuttlecockUsed: number;
  shareToken: string; notes: string | null;
  venue: { id: string; name: string; courtsCount: number; courts: Court[] };
  club: { id: string; name: string };
  players: SessionPlayer[];
  matches: Match[];
  expenses: Expense[];
  _count: { players: number; matches: number };
}

interface QueueEntry {
  id: string; position: number; currentWaitSeconds: number; roundsPlayed: number;
  user: { id: string; name: string; rankTier: string };
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id;

  const [session, setSession]   = useState<SessionData | null>(null);
  const [queue, setQueue]       = useState<QueueEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"courts" | "queue" | "matches" | "expenses">("courts");

  const [expCategory, setExpCategory] = useState("COURT");
  const [expAmount, setExpAmount]     = useState("");
  const [expDesc, setExpDesc]         = useState("");
  const [expError, setExpError]       = useState("");

  const [scoreMatch, setScoreMatch]   = useState<Match | null>(null);
  const [score1, setScore1]           = useState("");
  const [score2, setScore2]           = useState("");

  const [actionError, setActionError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [sRes, qRes] = await Promise.all([
        fetch(`/api/sessions/${id}`),
        fetch(`/api/sessions/${id}/queue`),
      ]);
      if (sRes.ok) setSession(await sRes.json());
      if (qRes.ok) setQueue(await qRes.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function post(path: string, body: object) {
    setActionError("");
    const res = await fetch(`/api/sessions/${id}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? "เกิดข้อผิดพลาด");
      return null;
    }
    return res.json();
  }

  async function handleCheckin() {
    if (!userId) return;
    const ok = await post("/checkin", { userId });
    if (ok) fetchData();
  }

  async function handleMatchmake() {
    const ok = await post("/matchmake", { strategy: "random", matchType: "DOUBLES" });
    if (ok) fetchData();
  }

  async function handleCallQueue() {
    const ok = await post("/queue/call", { count: 4 });
    if (ok) fetchData();
  }

  async function handleComplete() {
    setActionError("");
    const res = await fetch(`/api/sessions/${id}?action=complete`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? "เกิดข้อผิดพลาด");
    } else {
      fetchData();
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setExpError("");
    const res = await fetch(`/api/sessions/${id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: expCategory, amount: Number(expAmount), description: expDesc || undefined }),
    });
    if (!res.ok) {
      const data = await res.json();
      setExpError(data.error ?? "เกิดข้อผิดพลาด");
    } else {
      setExpAmount(""); setExpDesc("");
      fetchData();
    }
  }

  async function handleRecordScore(e: React.FormEvent) {
    e.preventDefault();
    if (!scoreMatch) return;
    setActionError("");
    const res = await fetch(`/api/sessions/${id}/matches`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: scoreMatch.id, team1Score: Number(score1), team2Score: Number(score2) }),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? "เกิดข้อผิดพลาด");
    } else {
      setScoreMatch(null); setScore1(""); setScore2("");
      fetchData();
    }
  }

  function copyShareLink() {
    if (!session) return;
    navigator.clipboard.writeText(`${window.location.origin}/join/${session.shareToken}`);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card text-center py-12 text-gray-500">ไม่พบกิจกรรม</div>
      </div>
    );
  }

  const st = STATUS_LABELS[session.status] ?? STATUS_LABELS.DRAFT;
  const date = new Date(session.date).toLocaleDateString("th-TH", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  const start = new Date(session.startTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const end   = new Date(session.endTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  const currentUserPlayer = session.players.find((p) => p.user.id === userId);
  const isCheckedIn = currentUserPlayer?.status === "CHECKED_IN" || currentUserPlayer?.status === "PLAYING";

  const activeMatches = session.matches.filter((m) => m.status === "IN_PROGRESS");
  const completedMatches = session.matches.filter((m) => m.status === "COMPLETED");
  const totalExpenses = session.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
              <span className={`badge ${st.color}`}>{st.label}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📅 {date}</span>
              <span>🕐 {start}–{end}</span>
              <span>📍 {session.venue.name} ({session.venue.courtsCount} คอร์ท)</span>
              <span>👥 {session._count.players}/{session.maxPlayers} คน</span>
              {session.costPerPerson > 0 && <span>💰 {formatCurrency(session.costPerPerson)}/คน</span>}
              {session.shuttlecockUsed > 0 && <span>🏸 ลูกที่ใช้: {session.shuttlecockUsed} ลูก</span>}
            </div>
            {session.notes && <p className="text-sm text-gray-500 mt-2">{session.notes}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {userId && !isCheckedIn && session.status !== "COMPLETED" && (
              <button onClick={handleCheckin} className="btn-primary">เช็คอิน</button>
            )}
            {isCheckedIn && <span className="badge bg-green-100 text-green-800">✓ เช็คอินแล้ว</span>}
            <a href={`/sessions/${id}/live`} className="btn-secondary">📺 Live</a>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {/* Quick Actions */}
      {session.status !== "COMPLETED" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button onClick={handleMatchmake} className="card text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">🎲</div>
            <div className="text-sm font-medium">สุ่มจัดคู่</div>
          </button>
          <button onClick={copyShareLink} className="card text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">📋</div>
            <div className="text-sm font-medium">ส่งลิงก์ลงชื่อ</div>
          </button>
          <button onClick={() => setActiveTab("expenses")} className="card text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-sm font-medium">เพิ่มค่าใช้จ่าย</div>
          </button>
          <button onClick={handleComplete}
            className="card text-center hover:shadow-md transition-shadow cursor-pointer text-red-600">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-medium">จบกิจกรรม</div>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: "courts",   label: `สนาม (${activeMatches.length})` },
          { key: "queue",    label: `คิวรอ (${queue.length})` },
          { key: "matches",  label: `รอบการเล่น (${completedMatches.length})` },
          { key: "expenses", label: "ค่าใช้จ่าย" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courts */}
      {activeTab === "courts" && (
        <div>
          {session.venue.courts.length === 0 && activeMatches.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">🏸</div>
              <p>ยังไม่มีการแข่งขัน</p>
              {session.status !== "COMPLETED" && (
                <button onClick={handleMatchmake} className="btn-primary mt-4">สุ่มจัดคู่เลย</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeMatches.map((match) => {
                const team1 = match.players.filter((p) => p.team === 1).map((p) => p.user.name);
                const team2 = match.players.filter((p) => p.team === 2).map((p) => p.user.name);
                return (
                  <div key={match.id} className="card border-2 border-green-400 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">Court {match.courtNumber}</h3>
                      <span className="badge bg-green-100 text-green-800">กำลังเล่น</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="text-blue-600 font-medium">{team1.join(", ")}</div>
                      <div className="font-bold text-lg text-gray-700">
                        {match.team1Score}–{match.team2Score}
                      </div>
                      <div className="text-red-600 font-medium">{team2.join(", ")}</div>
                    </div>
                    {session.status !== "COMPLETED" && (
                      <button onClick={() => { setScoreMatch(match); setScore1(""); setScore2(""); }}
                        className="btn-secondary w-full text-xs">บันทึกผล</button>
                    )}
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, session.venue.courtsCount - activeMatches.length) }, (_, i) => (
                <div key={`empty-${i}`} className="card border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Court {activeMatches.length + i + 1}</h3>
                    <span className="badge bg-gray-100 text-gray-600">ว่าง</span>
                  </div>
                  {session.status !== "COMPLETED" && (
                    <button onClick={handleCallQueue} className="btn-secondary w-full text-xs mt-2">
                      เรียกคิว 4 คน
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Queue */}
      {activeTab === "queue" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">คิวรอ ({queue.length} คน)</h3>
            {session.status !== "COMPLETED" && queue.length >= 4 && (
              <button onClick={handleCallQueue} className="btn-primary text-sm">เรียก 4 คนถัดไป</button>
            )}
          </div>
          {queue.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">ไม่มีผู้เล่นในคิว</p>
          ) : (
            <div className="space-y-3">
              {queue.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-8">{index + 1}</span>
                    <div>
                      <span className="font-medium text-gray-900">{entry.user.name}</span>
                      <span className={`badge ml-2 ${RANK_BADGE[entry.user.rankTier] ?? "badge-bronze"}`}>
                        {entry.user.rankTier}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>⏱️ รอ {formatDuration(entry.currentWaitSeconds)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Matches */}
      {activeTab === "matches" && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">ประวัติรอบการเล่น ({completedMatches.length} รอบ)</h3>
          {completedMatches.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีรอบที่เสร็จสิ้น</p>
          ) : (
            <div className="space-y-3">
              {completedMatches.map((match) => {
                const team1 = match.players.filter((p) => p.team === 1).map((p) => p.user.name);
                const team2 = match.players.filter((p) => p.team === 2).map((p) => p.user.name);
                const t1Win = match.team1Score > match.team2Score;
                return (
                  <div key={match.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">Court {match.courtNumber} · รอบ {match.roundNumber}</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`font-medium flex-1 ${t1Win ? "text-green-600" : "text-gray-600"}`}>
                        {t1Win && "🏆 "}{team1.join(", ")}
                      </span>
                      <span className="font-bold text-gray-900 tabular-nums">
                        {match.team1Score}–{match.team2Score}
                      </span>
                      <span className={`font-medium flex-1 text-right ${!t1Win ? "text-green-600" : "text-gray-600"}`}>
                        {team2.join(", ")}{!t1Win && " 🏆"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Expenses */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">ค่าใช้จ่าย</h3>
            {session.expenses.length === 0 ? (
              <p className="text-gray-400 text-sm">ยังไม่มีรายการค่าใช้จ่าย</p>
            ) : (
              <div className="space-y-2">
                {session.expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">
                      {exp.category === "COURT" ? "ค่าสนาม" : exp.category === "SHUTTLECOCK" ? "ค่าลูกขนไก่" : "อื่นๆ"}
                      {exp.description && <span className="text-gray-400 ml-1">({exp.description})</span>}
                    </span>
                    <span className="font-medium">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold">
                  <span>รวม</span>
                  <span>{formatCurrency(totalExpenses)}</span>
                </div>
                {session._count.players > 0 && (
                  <div className="flex justify-between py-2 text-primary-600 font-medium text-sm">
                    <span>ค่าต่อคน ({session._count.players} คน)</span>
                    <span>{formatCurrency(Math.ceil(totalExpenses / session._count.players))}/คน</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {session.status !== "COMPLETED" && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">เพิ่มค่าใช้จ่าย</h3>
              <form onSubmit={handleAddExpense} className="space-y-3">
                {expError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{expError}</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ประเภท</label>
                    <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="input w-full">
                      <option value="COURT">ค่าสนาม</option>
                      <option value="SHUTTLECOCK">ค่าลูกขนไก่</option>
                      <option value="OTHER">อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">จำนวน (บาท) *</label>
                    <input
                      type="number" min={1} required value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="input w-full" placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">หมายเหตุ</label>
                  <input
                    type="text" value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
                    className="input w-full" placeholder="รายละเอียดเพิ่มเติม..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full">เพิ่มรายการ</button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Score recording modal */}
      {scoreMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-center">บันทึกผลการแข่งขัน</h3>
            <div className="text-sm text-gray-600 text-center mb-4">
              {scoreMatch.players.filter((p) => p.team === 1).map((p) => p.user.name).join(", ")}
              <br /><span className="font-bold">vs</span><br />
              {scoreMatch.players.filter((p) => p.team === 2).map((p) => p.user.name).join(", ")}
            </div>
            <form onSubmit={handleRecordScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-center">ทีม 1</label>
                  <input
                    type="number" min={0} required value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="input w-full text-center text-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-center">ทีม 2</label>
                  <input
                    type="number" min={0} required value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="input w-full text-center text-2xl font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setScoreMatch(null)} className="btn-secondary flex-1">ยกเลิก</button>
                <button type="submit" className="btn-primary flex-1">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
