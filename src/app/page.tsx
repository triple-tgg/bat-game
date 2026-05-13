const RANK_STYLES: Record<string, string> = {
  DIAMOND: "badge-diamond", PLATINUM: "badge-platinum",
  GOLD: "badge-gold", SILVER: "badge-silver", BRONZE: "badge-bronze",
};

interface RankingPlayer {
  rank: number; id: string; name: string; rankPoints: number;
  rankTier: string; totalWins: number; totalLosses: number; winRate: number;
}

async function getTopPlayers(): Promise<RankingPlayer[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/rankings?limit=5`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const players = await getTopPlayers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🏸 BadmintonHub</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ระบบจัดการก๊วนแบดมินตัน จัดคิว จัดแร้งค์ ดูสถิติ จัดการเงิน ครบจบในที่เดียว
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a href="/sessions" className="btn-primary text-lg px-6 py-3">ดูกิจกรรมที่กำลังจะมา</a>
          <a href="/rankings" className="btn-secondary text-lg px-6 py-3">ดูอันดับ</a>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl mb-3">🎮</div>
          <h3 className="font-semibold text-gray-900 mb-2">ระบบแร้งค์</h3>
          <p className="text-sm text-gray-600">เก็บคะแนนจากการเล่น ไต่อันดับจาก Bronze สู่ Diamond</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">⏱️</div>
          <h3 className="font-semibold text-gray-900 mb-2">จัดคิวอัตโนมัติ</h3>
          <p className="text-sm text-gray-600">เช็คอิน → เข้าคิว → สุ่มจัดคู่ → เล่น → วนคิว</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="font-semibold text-gray-900 mb-2">จัดการเงิน</h3>
          <p className="text-sm text-gray-600">คิดค่าสนาม ค่าลูก หารเท่าอัตโนมัติ ติดตามการจ่ายเงิน</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏆 Top 5 อันดับ</h2>
          <a href="/rankings" className="text-sm text-primary-600 hover:text-primary-700">ดูทั้งหมด →</a>
        </div>

        {players.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">ยังไม่มีข้อมูลผู้เล่น</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">อันดับ</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้เล่น</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">แร้งค์</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">W/L</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">Win%</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <span className={`text-lg font-bold ${p.rank === 1 ? "text-yellow-500" : p.rank === 2 ? "text-gray-400" : p.rank === 3 ? "text-amber-600" : "text-gray-500"}`}>
                        #{p.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      <a href={`/players/${p.id}`} className="font-medium text-gray-900 hover:text-primary-600">{p.name}</a>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${RANK_STYLES[p.rankTier]}`}>{p.rankTier}</span>
                    </td>
                    <td className="py-3 text-right font-mono text-sm">{p.rankPoints.toLocaleString()}</td>
                    <td className="py-3 text-right text-sm text-gray-600">{p.totalWins}W/{p.totalLosses}L</td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${p.winRate >= 70 ? "text-green-600" : p.winRate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {p.winRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
