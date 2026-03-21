const MOCK_SESSIONS = [
  {
    id: "1",
    title: "แบดมินตันวันอังคาร",
    date: "2026-03-24",
    startTime: "18:00",
    endTime: "21:00",
    venue: "สนามแบดมินตัน A",
    status: "OPEN",
    playerCount: 12,
    maxPlayers: 20,
    costPerPerson: 150,
  },
  {
    id: "2",
    title: "แบดมินตันวันพฤหัส",
    date: "2026-03-26",
    startTime: "18:00",
    endTime: "21:00",
    venue: "สนามแบดมินตัน B",
    status: "FULL",
    playerCount: 16,
    maxPlayers: 16,
    costPerPerson: 120,
  },
  {
    id: "3",
    title: "แบดมินตันวันเสาร์",
    date: "2026-03-28",
    startTime: "09:00",
    endTime: "12:00",
    venue: "สนามแบดมินตัน A",
    status: "OPEN",
    playerCount: 8,
    maxPlayers: 24,
    costPerPerson: 100,
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "แบบร่าง", color: "bg-gray-100 text-gray-800" },
  OPEN: { label: "เปิดรับ", color: "bg-green-100 text-green-800" },
  FULL: { label: "เต็มแล้ว", color: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "กำลังเล่น", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800" },
};

export default function SessionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">กิจกรรม</h1>
        <a href="/sessions/new" className="btn-primary">
          + สร้างกิจกรรม
        </a>
      </div>

      <div className="grid gap-4">
        {MOCK_SESSIONS.map((session) => (
          <a
            key={session.id}
            href={`/sessions/${session.id}`}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {session.title}
                  </h2>
                  <span className={`badge ${STATUS_LABELS[session.status].color}`}>
                    {STATUS_LABELS[session.status].label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>📅 {session.date}</span>
                  <span>🕐 {session.startTime} - {session.endTime}</span>
                  <span>📍 {session.venue}</span>
                  <span>👥 {session.playerCount}/{session.maxPlayers} คน</span>
                  <span>💰 {session.costPerPerson} บาท/คน</span>
                </div>
              </div>
              <div className="text-2xl">
                {session.status === "OPEN" ? "→" : ""}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
