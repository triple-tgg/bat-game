import { formatCurrency } from "@/lib/utils";

const SUMMARY = {
  totalIncome: 18000,
  totalExpenses: 15600,
  balance: 2400,
  unpaidAmount: 3200,
};

const RECENT_SESSIONS = [
  {
    id: "1",
    title: "แบดวันอังคาร 18 มี.ค.",
    totalCost: 1800,
    perPerson: 150,
    players: 12,
    paid: 10,
    unpaid: 2,
    shuttlecocks: 8,
  },
  {
    id: "2",
    title: "แบดวันพฤหัส 20 มี.ค.",
    totalCost: 2400,
    perPerson: 150,
    players: 16,
    paid: 14,
    unpaid: 2,
    shuttlecocks: 12,
  },
];

const UNPAID_PLAYERS = [
  { name: "ธนา", session: "แบดวันอังคาร 18 มี.ค.", amount: 150 },
  { name: "สุดา", session: "แบดวันอังคาร 18 มี.ค.", amount: 150 },
  { name: "กมล", session: "แบดวันพฤหัส 20 มี.ค.", amount: 150 },
  { name: "วรรณ", session: "แบดวันพฤหัส 20 มี.ค.", amount: 150 },
];

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">💰 การเงิน</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-500">รายรับทั้งหมด</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(SUMMARY.totalIncome)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">รายจ่ายทั้งหมด</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(SUMMARY.totalExpenses)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">คงเหลือ</div>
          <div className="text-2xl font-bold text-primary-600">
            {formatCurrency(SUMMARY.balance)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">ค้างจ่าย</div>
          <div className="text-2xl font-bold text-orange-500">
            {formatCurrency(SUMMARY.unpaidAmount)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Expenses */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">สรุปค่าใช้จ่ายรายกิจกรรม</h2>
          <div className="space-y-4">
            {RECENT_SESSIONS.map((session) => (
              <div key={session.id} className="border border-gray-100 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">{session.title}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">ค่าใช้จ่ายรวม:</div>
                  <div className="text-right font-medium">{formatCurrency(session.totalCost)}</div>
                  <div className="text-gray-600">ต่อคน:</div>
                  <div className="text-right">{formatCurrency(session.perPerson)}</div>
                  <div className="text-gray-600">ผู้เล่น:</div>
                  <div className="text-right">{session.players} คน</div>
                  <div className="text-gray-600">ลูกขนไก่:</div>
                  <div className="text-right">{session.shuttlecocks} ลูก</div>
                  <div className="text-gray-600">สถานะจ่ายเงิน:</div>
                  <div className="text-right">
                    <span className="text-green-600">{session.paid} จ่ายแล้ว</span>
                    {session.unpaid > 0 && (
                      <span className="text-red-600 ml-1">/ {session.unpaid} ค้าง</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unpaid List */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">รายชื่อค้างจ่าย</h2>
          <div className="space-y-3">
            {UNPAID_PLAYERS.map((player, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{player.name}</div>
                  <div className="text-xs text-gray-500">{player.session}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-red-600">
                    {formatCurrency(player.amount)}
                  </span>
                  <button className="btn-primary text-xs px-2 py-1">
                    จ่ายแล้ว
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
