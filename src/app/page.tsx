const RANK_STYLES: Record<string, string> = {
  DIAMOND: "badge-diamond",
  PLATINUM: "badge-platinum",
  GOLD: "badge-gold",
  SILVER: "badge-silver",
  BRONZE: "badge-bronze",
};

const RANK_LABELS: Record<string, string> = {
  DIAMOND: "Diamond",
  PLATINUM: "Platinum",
  GOLD: "Gold",
  SILVER: "Silver",
  BRONZE: "Bronze",
};

// Mock data for initial display (replace with API call)
const TOP_PLAYERS = [
  { rank: 1, name: "สมชาย", rankPoints: 2150, rankTier: "DIAMOND", totalWins: 89, totalLosses: 21, winRate: 81 },
  { rank: 2, name: "สมหญิง", rankPoints: 1850, rankTier: "PLATINUM", totalWins: 75, totalLosses: 30, winRate: 71 },
  { rank: 3, name: "วิชัย", rankPoints: 1620, rankTier: "PLATINUM", totalWins: 68, totalLosses: 35, winRate: 66 },
  { rank: 4, name: "พรทิพย์", rankPoints: 1200, rankTier: "PLATINUM", totalWins: 55, totalLosses: 32, winRate: 63 },
  { rank: 5, name: "อดิศร", rankPoints: 980, rankTier: "GOLD", totalWins: 48, totalLosses: 30, winRate: 62 },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏸 BadmintonHub
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ระบบจัดการก๊วนแบดมินตัน จัดคิว จัดแร้งค์ ดูสถิติ จัดการเงิน ครบจบในที่เดียว
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a href="/sessions" className="btn-primary text-lg px-6 py-3">
            ดูกิจกรรมที่กำลังจะมา
          </a>
          <a href="/rankings" className="btn-secondary text-lg px-6 py-3">
            ดูอันดับ
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl mb-3">🎮</div>
          <h3 className="font-semibold text-gray-900 mb-2">ระบบแร้งค์</h3>
          <p className="text-sm text-gray-600">
            เก็บคะแนนจากการเล่น ไต่อันดับจาก Bronze สู่ Diamond
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">⏱️</div>
          <h3 className="font-semibold text-gray-900 mb-2">จัดคิวอัตโนมัติ</h3>
          <p className="text-sm text-gray-600">
            เช็คอิน → เข้าคิว → สุ่มจัดคู่ → เล่น → วนคิว
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="font-semibold text-gray-900 mb-2">จัดการเงิน</h3>
          <p className="text-sm text-gray-600">
            คิดค่าสนาม ค่าลูก หารเท่าอัตโนมัติ ติดตามการจ่ายเงิน
          </p>
        </div>
      </div>

      {/* Top 10 Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏆 Top 10 อันดับ</h2>
          <a href="/rankings" className="text-sm text-primary-600 hover:text-primary-700">
            ดูทั้งหมด →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">อันดับ</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้เล่น</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">แร้งค์</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">ชนะ/แพ้</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PLAYERS.map((player) => (
                <tr key={player.rank} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <span className={`text-lg font-bold ${
                      player.rank === 1 ? "text-yellow-500" :
                      player.rank === 2 ? "text-gray-400" :
                      player.rank === 3 ? "text-amber-600" : "text-gray-600"
                    }`}>
                      #{player.rank}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-gray-900">{player.name}</td>
                  <td className="py-3">
                    <span className={`badge ${RANK_STYLES[player.rankTier]}`}>
                      {RANK_LABELS[player.rankTier]}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-sm">{player.rankPoints.toLocaleString()}</td>
                  <td className="py-3 text-right text-sm text-gray-600">
                    {player.totalWins}W / {player.totalLosses}L
                  </td>
                  <td className="py-3 text-right">
                    <span className={`font-medium ${
                      player.winRate >= 70 ? "text-green-600" :
                      player.winRate >= 50 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {player.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
