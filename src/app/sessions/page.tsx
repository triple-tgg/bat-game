import { formatCurrency } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:       { label: "แบบร่าง",    color: "bg-gray-100 text-gray-800" },
  OPEN:        { label: "เปิดรับ",    color: "bg-green-100 text-green-800" },
  FULL:        { label: "เต็มแล้ว",   color: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "กำลังเล่น", color: "bg-blue-100 text-blue-800" },
  COMPLETED:   { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-600" },
  CANCELLED:   { label: "ยกเลิก",    color: "bg-red-100 text-red-800" },
};

interface Session {
  id: string; title: string; date: string; startTime: string; endTime: string;
  status: string; costPerPerson: number; maxPlayers: number;
  venue: { name: string };
  _count: { players: number };
}

async function getSessions(): Promise<Session[]> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/sessions`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">กิจกรรม</h1>
        <a href="/sessions/new" className="btn-primary">+ สร้างกิจกรรม</a>
      </div>

      {sessions.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <div className="text-4xl mb-4">🏸</div>
          <p className="text-lg font-medium">ยังไม่มีกิจกรรม</p>
          <a href="/sessions/new" className="btn-primary mt-4 inline-block">สร้างกิจกรรมแรก</a>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => {
            const st = STATUS_LABELS[s.status] ?? STATUS_LABELS.DRAFT;
            const date = new Date(s.date).toLocaleDateString("th-TH", {
              weekday: "short", year: "numeric", month: "short", day: "numeric",
            });
            const start = new Date(s.startTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
            const end   = new Date(s.endTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

            return (
              <a key={s.id} href={`/sessions/${s.id}`} className="card hover:shadow-md transition-shadow block">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-lg font-semibold text-gray-900">{s.title}</h2>
                      <span className={`badge ${st.color}`}>{st.label}</span>
                      {s.status === "OPEN" && (
                        <span className="text-xs text-green-600 font-medium">
                          ว่าง {s.maxPlayers - s._count.players} ที่
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {date}</span>
                      <span>🕐 {start}–{end}</span>
                      <span>📍 {s.venue.name}</span>
                      <span>👥 {s._count.players}/{s.maxPlayers} คน</span>
                      {s.costPerPerson > 0 && <span>💰 {formatCurrency(s.costPerPerson)}/คน</span>}
                    </div>
                  </div>
                  <span className="text-gray-400 ml-4 shrink-0">→</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
