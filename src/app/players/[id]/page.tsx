import { formatDuration } from "@/lib/utils";

const PLAYER = {
  name: "สมชาย",
  rankPoints: 2150,
  rankTier: "DIAMOND",
  totalWins: 89,
  totalLosses: 21,
  totalSessions: 45,
  streak: 8,
  winRate: 81,
};

const RECENT_MATCHES = [
  { date: "2026-03-20", opponent: "สมหญิง & วิชัย", partner: "พรทิพย์", result: "W", score: "21-15" },
  { date: "2026-03-20", opponent: "อดิศร & มานะ", partner: "นภา", result: "W", score: "21-18" },
  { date: "2026-03-18", opponent: "ปิยะ & ธนา", partner: "สุดา", result: "L", score: "18-21" },
  { date: "2026-03-18", opponent: "สมหญิง & มานะ", partner: "วิชัย", result: "W", score: "21-12" },
  { date: "2026-03-15", opponent: "พรทิพย์ & อดิศร", partner: "ปิยะ", result: "W", score: "21-16" },
];

const BEST_PARTNERS = [
  { name: "พรทิพย์", wins: 25, total: 30, winRate: 83 },
  { name: "วิชัย", wins: 20, total: 28, winRate: 71 },
  { name: "นภา", wins: 15, total: 22, winRate: 68 },
];

export default function PlayerProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Player Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl">
            🏸
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{PLAYER.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="badge badge-diamond text-sm px-3 py-1">
                {PLAYER.rankTier}
              </span>
              <span className="text-lg font-mono font-bold text-primary-600">
                {PLAYER.rankPoints.toLocaleString()} pts
              </span>
              {PLAYER.streak > 0 && (
                <span className="text-orange-500 font-medium">
                  🔥 {PLAYER.streak} streak
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{PLAYER.totalWins}</div>
          <div className="text-sm text-gray-500">ชนะ</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{PLAYER.totalLosses}</div>
          <div className="text-sm text-gray-500">แพ้</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{PLAYER.winRate}%</div>
          <div className="text-sm text-gray-500">Win Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{PLAYER.totalSessions}</div>
          <div className="text-sm text-gray-500">กิจกรรม</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">รอบการเล่นล่าสุด</h2>
          <div className="space-y-3">
            {RECENT_MATCHES.map((match, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm">
                    <span className="font-medium">{PLAYER.name}</span>
                    <span className="text-gray-400"> & </span>
                    <span>{match.partner}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    vs {match.opponent}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${match.result === "W" ? "text-green-600" : "text-red-600"}`}>
                    {match.result === "W" ? "ชนะ" : "แพ้"} {match.score}
                  </span>
                  <div className="text-xs text-gray-400">{match.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Partners */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">คู่หูที่ดีที่สุด</h2>
          <div className="space-y-4">
            {BEST_PARTNERS.map((partner, i) => (
              <div key={partner.name} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-medium">{partner.name}</div>
                  <div className="text-xs text-gray-500">
                    {partner.wins}W / {partner.total} games
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{partner.winRate}%</div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${partner.winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
