const RANK_STYLES: Record<string, string> = {
  DIAMOND: "badge-diamond",
  PLATINUM: "badge-platinum",
  GOLD: "badge-gold",
  SILVER: "badge-silver",
  BRONZE: "badge-bronze",
};

const ALL_PLAYERS = [
  { rank: 1, name: "สมชาย", rankPoints: 2150, rankTier: "DIAMOND", totalWins: 89, totalLosses: 21, totalSessions: 45, streak: 8, winRate: 81 },
  { rank: 2, name: "สมหญิง", rankPoints: 1850, rankTier: "PLATINUM", totalWins: 75, totalLosses: 30, totalSessions: 40, streak: 5, winRate: 71 },
  { rank: 3, name: "วิชัย", rankPoints: 1620, rankTier: "PLATINUM", totalWins: 68, totalLosses: 35, totalSessions: 38, streak: 3, winRate: 66 },
  { rank: 4, name: "พรทิพย์", rankPoints: 1200, rankTier: "PLATINUM", totalWins: 55, totalLosses: 32, totalSessions: 35, streak: 2, winRate: 63 },
  { rank: 5, name: "อดิศร", rankPoints: 980, rankTier: "GOLD", totalWins: 48, totalLosses: 30, totalSessions: 30, streak: 4, winRate: 62 },
  { rank: 6, name: "มานะ", rankPoints: 820, rankTier: "GOLD", totalWins: 40, totalLosses: 28, totalSessions: 28, streak: 1, winRate: 59 },
  { rank: 7, name: "ปิยะ", rankPoints: 650, rankTier: "GOLD", totalWins: 35, totalLosses: 30, totalSessions: 25, streak: 0, winRate: 54 },
  { rank: 8, name: "นภา", rankPoints: 480, rankTier: "SILVER", totalWins: 28, totalLosses: 25, totalSessions: 22, streak: 2, winRate: 53 },
  { rank: 9, name: "ธนา", rankPoints: 320, rankTier: "SILVER", totalWins: 20, totalLosses: 22, totalSessions: 18, streak: 0, winRate: 48 },
  { rank: 10, name: "สุดา", rankPoints: 180, rankTier: "BRONZE", totalWins: 12, totalLosses: 18, totalSessions: 12, streak: 1, winRate: 40 },
];

export default function RankingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 อันดับผู้เล่น</h1>
      <p className="text-gray-600 mb-8">คะแนนจากการเข้าร่วมกิจกรรมและผลการแข่ง</p>

      {/* Rank Tier Legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"].map((tier) => (
          <span key={tier} className={`badge ${RANK_STYLES[tier]}`}>
            {tier} {tier === "DIAMOND" ? "2000+" : tier === "PLATINUM" ? "1000+" : tier === "GOLD" ? "500+" : tier === "SILVER" ? "200+" : "0+"}
          </span>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[ALL_PLAYERS[1], ALL_PLAYERS[0], ALL_PLAYERS[2]].map((player, i) => {
          const positions = [2, 1, 3];
          const sizes = ["h-32", "h-40", "h-28"];
          const medals = ["🥈", "🥇", "🥉"];
          return (
            <div key={player.name} className="text-center">
              <div className="text-3xl mb-2">{medals[i]}</div>
              <div className="font-bold text-lg">{player.name}</div>
              <div className={`badge ${RANK_STYLES[player.rankTier]} mb-2`}>
                {player.rankTier}
              </div>
              <div className={`mx-auto w-20 ${sizes[i]} rounded-t-lg ${
                positions[i] === 1 ? "bg-yellow-400" :
                positions[i] === 2 ? "bg-gray-300" : "bg-amber-600"
              } flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">
                  {player.rankPoints}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <div className="card overflow-x-auto">
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
            {ALL_PLAYERS.map((p) => (
              <tr key={p.rank} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-bold text-gray-500">#{p.rank}</td>
                <td className="py-3">
                  <a href={`/players/${p.rank}`} className="font-medium text-gray-900 hover:text-primary-600">
                    {p.name}
                  </a>
                </td>
                <td className="py-3">
                  <span className={`badge ${RANK_STYLES[p.rankTier]}`}>{p.rankTier}</span>
                </td>
                <td className="py-3 text-right font-mono">{p.rankPoints.toLocaleString()}</td>
                <td className="py-3 text-right text-sm">{p.totalWins}W/{p.totalLosses}L</td>
                <td className="py-3 text-right">
                  <span className={p.winRate >= 60 ? "text-green-600" : p.winRate >= 50 ? "text-yellow-600" : "text-red-600"}>
                    {p.winRate}%
                  </span>
                </td>
                <td className="py-3 text-right text-sm text-gray-600">{p.totalSessions}</td>
                <td className="py-3 text-right">
                  {p.streak > 0 && <span className="text-orange-500">🔥{p.streak}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
