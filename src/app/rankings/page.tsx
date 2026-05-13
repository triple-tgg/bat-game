const RANK_STYLES: Record<string, string> = {
  DIAMOND: "badge-diamond", PLATINUM: "badge-platinum",
  GOLD: "badge-gold", SILVER: "badge-silver", BRONZE: "badge-bronze",
};

const TIER_MIN: Record<string, string> = {
  DIAMOND: "2000+", PLATINUM: "1000+", GOLD: "500+", SILVER: "200+", BRONZE: "0+",
};

interface Player {
  rank: number; id: string; name: string; rankPoints: number; rankTier: string;
  totalWins: number; totalLosses: number; totalSessions: number; streak: number; winRate: number;
}

async function getRankings(): Promise<Player[]> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/rankings?limit=50`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function RankingsPage() {
  const players = await getRankings();
  const top3 = players.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 อันดับผู้เล่น</h1>
      <p className="text-gray-600 mb-8">คะแนนจากการเข้าร่วมกิจกรรมและผลการแข่ง</p>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"].map((tier) => (
          <span key={tier} className={`badge ${RANK_STYLES[tier]}`}>
            {tier} {TIER_MIN[tier]}
          </span>
        ))}
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8 items-end">
          {[top3[1], top3[0], top3[2]].map((p, i) => {
            const medals = ["🥈", "🥇", "🥉"];
            const heights = ["h-28", "h-40", "h-24"];
            const colors = ["bg-gray-300", "bg-yellow-400", "bg-amber-600"];
            return (
              <div key={p.id} className="text-center">
                <div className="text-3xl mb-1">{medals[i]}</div>
                <a href={`/players/${p.id}`} className="font-bold text-base hover:text-primary-600 block">{p.name}</a>
                <span className={`badge ${RANK_STYLES[p.rankTier]} mb-2`}>{p.rankTier}</span>
                <div className={`mx-auto w-full max-w-[80px] ${heights[i]} ${colors[i]} rounded-t-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{p.rankPoints.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-x-auto">
        {players.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">ยังไม่มีข้อมูลผู้เล่น</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้เล่น</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">แร้งค์</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">W/L</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">Win%</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">กิจกรรม</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase">Streak</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-bold text-gray-500">#{p.rank}</td>
                  <td className="py-3">
                    <a href={`/players/${p.id}`} className="font-medium text-gray-900 hover:text-primary-600">{p.name}</a>
                  </td>
                  <td className="py-3"><span className={`badge ${RANK_STYLES[p.rankTier]}`}>{p.rankTier}</span></td>
                  <td className="py-3 text-right font-mono text-sm">{p.rankPoints.toLocaleString()}</td>
                  <td className="py-3 text-right text-sm">{p.totalWins}W/{p.totalLosses}L</td>
                  <td className="py-3 text-right">
                    <span className={p.winRate >= 60 ? "text-green-600 font-medium" : p.winRate >= 50 ? "text-yellow-600" : "text-red-600"}>
                      {p.winRate}%
                    </span>
                  </td>
                  <td className="py-3 text-right text-sm text-gray-600">{p.totalSessions}</td>
                  <td className="py-3 text-right">
                    {p.streak > 0 && <span className="text-orange-500 font-medium">🔥{p.streak}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
