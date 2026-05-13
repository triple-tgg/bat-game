import { formatCurrency } from "@/lib/utils";

interface FinanceData {
  period: string;
  sessionCount: number;
  totalExpenses: number;
  breakdown: { court: number; shuttlecock: number; other: number };
  totalCollected: number;
  totalUnpaid: number;
  balance: number;
  shuttlecockUsed: number;
  sessions: {
    id: string; title: string; date: string;
    totalCost: number; costPerPerson: number; shuttlecockUsed: number;
    _count: { players: number };
  }[];
}

async function getFinance(period: string): Promise<FinanceData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/finance?period=${period}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "monthly" } = await searchParams;
  const data = await getFinance(period);

  const PERIOD_LABELS: Record<string, string> = {
    monthly: "เดือนนี้", yearly: "ปีนี้", all: "ทั้งหมด",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">💰 การเงิน</h1>
        <div className="flex gap-2">
          {["monthly", "yearly", "all"].map((p) => (
            <a key={p} href={`/finance?period=${p}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                period === p
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}>
              {PERIOD_LABELS[p]}
            </a>
          ))}
        </div>
      </div>

      {!data ? (
        <div className="card text-center py-12 text-gray-500">ไม่สามารถโหลดข้อมูลได้</div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "รายรับรวม", value: data.totalCollected, color: "text-green-600" },
              { label: "รายจ่ายรวม", value: data.totalExpenses, color: "text-red-600" },
              { label: "คงเหลือ", value: data.balance, color: data.balance >= 0 ? "text-primary-600" : "text-red-600" },
              { label: "ค้างจ่าย", value: data.totalUnpaid, color: "text-orange-500" },
            ].map((item) => (
              <div key={item.label} className="card">
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className={`text-2xl font-bold mt-1 ${item.color}`}>{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakdown */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">รายละเอียดค่าใช้จ่าย</h2>
              <div className="space-y-3">
                {[
                  { label: "ค่าสนาม", value: data.breakdown.court },
                  { label: "ค่าลูกขนไก่", value: data.breakdown.shuttlecock },
                  { label: "อื่นๆ", value: data.breakdown.other },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold text-gray-900">
                  <span>รวม</span>
                  <span>{formatCurrency(data.totalExpenses)}</span>
                </div>
                <div className="pt-2 text-sm text-gray-500 flex justify-between">
                  <span>กิจกรรม {data.sessionCount} ครั้ง</span>
                  <span>ลูก {data.shuttlecockUsed} ลูก</span>
                </div>
              </div>
            </div>

            {/* Sessions breakdown */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">สรุปรายกิจกรรม</h2>
              {data.sessions.length === 0 ? (
                <p className="text-gray-400 text-sm">ยังไม่มีกิจกรรมที่เสร็จสิ้น</p>
              ) : (
                <div className="space-y-3">
                  {data.sessions.map((s) => {
                    const date = new Date(s.date).toLocaleDateString("th-TH", { month: "short", day: "numeric" });
                    return (
                      <div key={s.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <a href={`/sessions/${s.id}`} className="font-medium text-gray-900 hover:text-primary-600 text-sm">{s.title}</a>
                          <span className="text-xs text-gray-400">{date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <span>💰 {formatCurrency(s.totalCost)}</span>
                          <span>👥 {s._count.players} คน</span>
                          <span>🏸 {s.shuttlecockUsed} ลูก</span>
                        </div>
                        {s.costPerPerson > 0 && (
                          <div className="text-xs text-primary-600 font-medium mt-1">
                            {formatCurrency(s.costPerPerson)}/คน
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
