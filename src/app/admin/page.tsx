import { formatCurrency } from "@/lib/utils";

const STATS = {
  totalPlayers: 42,
  activeSessions: 3,
  monthlyRevenue: 28500,
  unpaidAmount: 4200,
  shuttlecocksThisMonth: 96,
  topSession: "แบดวันอังคาร",
};

const RECENT_SESSIONS = [
  { id: "1", title: "แบดวันอังคาร 18 มี.ค.", players: 14, status: "COMPLETED", cost: 2100 },
  { id: "2", title: "แบดวันพฤหัส 20 มี.ค.", players: 16, status: "COMPLETED", cost: 2400 },
  { id: "3", title: "แบดวันอังคาร 25 มี.ค.", players: 12, status: "OPEN", cost: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800",
  FULL: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_TH: Record<string, string> = {
  OPEN: "เปิดรับ",
  FULL: "เต็ม",
  IN_PROGRESS: "กำลังเล่น",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">ภาพรวมก๊วนแบดมินตัน</p>
        </div>
        <div className="flex gap-3">
          <a href="/venues" className="btn-secondary">จัดการสนาม</a>
          <a href="/sessions/new" className="btn-primary">+ กิจกรรมใหม่</a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "ผู้เล่นทั้งหมด", value: STATS.totalPlayers, icon: "👥", color: "text-primary-600" },
          { label: "กิจกรรมที่เปิด", value: STATS.activeSessions, icon: "📅", color: "text-green-600" },
          { label: "รายรับเดือนนี้", value: formatCurrency(STATS.monthlyRevenue), icon: "💰", color: "text-green-600" },
          { label: "ค้างจ่าย", value: formatCurrency(STATS.unpaidAmount), icon: "⚠️", color: "text-orange-500" },
          { label: "ลูกขนไก่/เดือน", value: `${STATS.shuttlecocksThisMonth} ลูก`, icon: "🏸", color: "text-gray-700" },
          { label: "กิจกรรมยอดนิยม", value: STATS.topSession, icon: "🏆", color: "text-yellow-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">กิจกรรมล่าสุด</h2>
            <a href="/sessions" className="text-sm text-primary-600">ดูทั้งหมด →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-gray-500">กิจกรรม</th>
                  <th className="pb-2 text-center text-gray-500">ผู้เล่น</th>
                  <th className="pb-2 text-center text-gray-500">สถานะ</th>
                  <th className="pb-2 text-right text-gray-500">ค่าใช้จ่าย</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {RECENT_SESSIONS.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{s.title}</td>
                    <td className="py-3 text-center text-gray-600">{s.players}</td>
                    <td className="py-3 text-center">
                      <span className={`badge ${STATUS_COLORS[s.status]}`}>
                        {STATUS_TH[s.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right">{s.cost > 0 ? formatCurrency(s.cost) : "-"}</td>
                    <td className="py-3 text-right">
                      <a href={`/sessions/${s.id}`} className="text-primary-600 hover:underline">
                        ดู
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: "/sessions/new", icon: "📅", label: "สร้างกิจกรรมใหม่" },
              { href: "/venues", icon: "🏟️", label: "จัดการสนาม" },
              { href: "/rankings", icon: "🏆", label: "ดูอันดับผู้เล่น" },
              { href: "/finance", icon: "💰", label: "รายงานการเงิน" },
              { href: "/admin/players", icon: "👥", label: "จัดการผู้เล่น" },
              { href: "/admin/achievements", icon: "🎖️", label: "จัดการ Achievement" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                <span className="ml-auto text-gray-400">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
