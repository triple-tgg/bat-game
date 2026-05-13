import { notFound } from "next/navigation";

const RANK_STYLES: Record<string, string> = {
  DIAMOND: "badge-diamond", PLATINUM: "badge-platinum",
  GOLD: "badge-gold", SILVER: "badge-silver", BRONZE: "badge-bronze",
};

interface PlayerStats {
  player: {
    id: string; name: string; avatarUrl: string | null;
    rankPoints: number; rankTier: string;
    totalWins: number; totalLosses: number; totalSessions: number; streak: number;
  };
  winRate: number;
  recentMatches: {
    id: string; isWinner: boolean;
    match: {
      team1Score: number; team2Score: number;
      session: { title: string; date: string };
      players: { userId: string; team: number; user: { name: string } }[];
    };
  }[];
  bestPartners: { partnerId: string; partnerName: string; wins: number; totalGames: number }[];
  achievements: { achievement: { name: string; description: string; iconUrl: string | null } }[];
}

async function getPlayerStats(id: string): Promise<PlayerStats | null> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/players/${id}/stats`,
      { cache: "no-store" }
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerStats(id);
  if (!data) notFound();

  const { player, winRate, recentMatches, bestPartners, achievements } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl shrink-0">
            {player.avatarUrl ? (
              <img src={player.avatarUrl} alt={player.name} className="h-full w-full rounded-full object-cover" />
            ) : "🏸"}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className={`badge text-sm px-3 py-1 ${RANK_STYLES[player.rankTier]}`}>{player.rankTier}</span>
              <span className="text-lg font-mono font-bold text-primary-600">
                {player.rankPoints.toLocaleString()} pts
              </span>
              {player.streak > 0 && (
                <span className="text-orange-500 font-medium">🔥 {player.streak} streak</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { value: player.totalWins, label: "ชนะ", color: "text-green-600" },
          { value: player.totalLosses, label: "แพ้", color: "text-red-600" },
          { value: `${winRate}%`, label: "Win Rate", color: "text-primary-600" },
          { value: player.totalSessions, label: "กิจกรรม", color: "text-gray-900" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-3">🏅 ความสำเร็จ</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.map((ua, i) => (
              <div key={i} title={ua.achievement.description}
                className="flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-sm">
                <span>{ua.achievement.iconUrl ?? "🏅"}</span>
                <span className="font-medium text-yellow-800">{ua.achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent matches */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">รอบการเล่นล่าสุด</h2>
          {recentMatches.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีประวัติการแข่ง</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((mp) => {
                const allies = mp.match.players
                  .filter((p) => p.team === mp.match.players.find((x) => x.userId === id)?.team && p.userId !== id)
                  .map((p) => p.user.name).join(", ");
                const opponents = mp.match.players
                  .filter((p) => p.team !== mp.match.players.find((x) => x.userId === id)?.team)
                  .map((p) => p.user.name).join(", ");
                const date = new Date(mp.match.session.date).toLocaleDateString("th-TH", { month: "short", day: "numeric" });
                return (
                  <div key={mp.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      {allies && <div className="text-xs text-gray-400">คู่หู: {allies}</div>}
                      <div className="text-xs text-gray-500">vs {opponents}</div>
                      <div className="text-xs text-gray-400">{mp.match.session.title} · {date}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`font-bold text-sm ${mp.isWinner ? "text-green-600" : "text-red-600"}`}>
                        {mp.isWinner ? "ชนะ" : "แพ้"} {mp.match.team1Score}–{mp.match.team2Score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Best partners */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">คู่หูที่ดีที่สุด</h2>
          {bestPartners.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-4">
              {(bestPartners as { partnerId: string; partnerName: string; wins: bigint | number; totalGames: bigint | number }[]).map((p, i) => {
                const wins = Number(p.wins);
                const total = Number(p.totalGames);
                const wr = total > 0 ? Math.round((wins / total) * 100) : 0;
                return (
                  <div key={p.partnerId} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">{i + 1}</span>
                    <div className="flex-1">
                      <a href={`/players/${p.partnerId}`} className="font-medium hover:text-primary-600">{p.partnerName}</a>
                      <div className="text-xs text-gray-500">{wins}W / {total} games</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">{wr}%</div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${wr}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
