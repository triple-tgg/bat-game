import { formatCurrency } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  OPEN:        "bg-green-100 text-green-800",
  FULL:        "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED:   "bg-gray-100 text-gray-600",
  CANCELLED:   "bg-red-100 text-red-800",
  DRAFT:       "bg-gray-100 text-gray-500",
};

const STATUS_TH: Record<string, string> = {
  OPEN: "เปิดรับ", FULL: "เต็ม", IN_PROGRESS: "กำลังเล่น",
  COMPLETED: "เสร็จสิ้น", CANCELLED: "ยกเลิก", DRAFT: "แบบร่าง",
};

interface Session {
  id: string; title: string; date: string; status: string;
  totalCost: number;
  _count: { players: number };
}

interface FinanceData {
  totalCollected: number; totalUnpaid: number; shuttlecockUsed: number;
  sessions: { id: string; title: string }[];
}

async function getData() {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const [playersRes, sessionsRes, financeRes] = await Promise.all([
    fetch(`${base}/api/rankings?limit=200`, { cache: "no-store" }),
    fetch(`${base}/api/sessions`, { cache: "no-store" }),
    fetch(`${base}/api/finance?period=monthly`, { cache: "no-store" }),
  ]);

  const players: { id: string }[] = playersRes.ok ? await playersRes.json() : [];
  const sessions: Session[] = sessionsRes.ok ? await sessionsRes.json() : [];
  const finance: FinanceData | null = financeRes.ok ? await financeRes.json() : null;

  const activeSessions = sessions.filter((s) =>
    ["OPEN", "FULL", "IN_PROGRESS"].includes(s.status)
  ).length;

  const topSession = sessions
    .filter((s) => s.status === "COMPLETED")
    .sort((a, b) => b._count.players - a._count.players)[0];

  return {
    totalPlayers: players.length,
    activeSessions,
    monthlyRevenue: finance?.totalCollected ?? 0,
    unpaidAmount: finance?.totalUnpaid ?? 0,
    shuttlecocksThisMonth: finance?.shuttlecockUsed ?? 0,
    topSession: topSession?.title ?? "-",
    recentSessions: sessions.slice(0, 8),
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.user?.role !== "ADMIN") redirect("/");

  const data = await getData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับ {session.user?.name}</p>
        </div>
        <div className="flex gap-3">
          <a href="/venues" className="btn-secondary">จัดการสนาม</a>
          <a href="/sessions/new" className="btn-primary">+ กิจกรรมใหม่</a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "ผู้เล่นทั้งหมด",    value: data.totalPlayers,                            icon: "👥", color: "text-primary-600" },
          { label: "กิจกรรมที่เปิด",     value: data.activeSessions,                          icon: "📅", color: "text-green-600" },
          { label: "รายรับเดือนนี้",     value: formatCurrency(data.monthlyRevenue),           icon: "💰", color: "text-green-600" },
          { label: "ค้างจ่าย",          value: formatCurrency(data.unpaidAmount),              icon: "⚠️", color: "text-orange-500" },
          { label: "ลูกขนไก่/เดือน",    value: `${data.shuttlecocksThisMonth} ลูก`,           icon: "🏸", color: "text-gray-700" },
          { label: "กิจกรรมยอดนิยม",    value: data.topSession,                               icon: "🏆", color: "text-yellow-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color} truncate`}>{kpi.value}</div>
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
          {data.recentSessions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">ยังไม่มีกิจกรรม</p>
          ) : (
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
                  {data.recentSessions.map((s) => {
                    const date = new Date(s.date).toLocaleDateString("th-TH", { month: "short", day: "numeric" });
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3">
                          <div className="font-medium text-gray-900">{s.title}</div>
                          <div className="text-xs text-gray-400">{date}</div>
                        </td>
                        <td className="py-3 text-center text-gray-600">{s._count.players}</td>
                        <td className="py-3 text-center">
                          <span className={`badge ${STATUS_COLORS[s.status] ?? STATUS_COLORS.DRAFT}`}>
                            {STATUS_TH[s.status] ?? s.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-600">
                          {s.totalCost > 0 ? formatCurrency(s.totalCost) : "-"}
                        </td>
                        <td className="py-3 text-right">
                          <a href={`/sessions/${s.id}`} className="text-primary-600 hover:underline">ดู</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/sessions/new", icon: "📅", label: "สร้างกิจกรรมใหม่" },
              { href: "/sessions",     icon: "📋", label: "ดูกิจกรรมทั้งหมด" },
              { href: "/venues",       icon: "🏟️", label: "จัดการสนาม" },
              { href: "/rankings",     icon: "🏆", label: "ดูอันดับผู้เล่น" },
              { href: "/finance",      icon: "💰", label: "รายงานการเงิน" },
            ].map((action) => (
              <a key={action.href} href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                <span className="ml-auto text-gray-400">→</span>
              </a>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">ข้อมูลเดือนนี้</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">รายรับ</span>
                <span className="font-medium text-green-600">{formatCurrency(data.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ค้างจ่าย</span>
                <span className="font-medium text-orange-500">{formatCurrency(data.unpaidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ลูกที่ใช้</span>
                <span className="font-medium">{data.shuttlecocksThisMonth} ลูก</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
