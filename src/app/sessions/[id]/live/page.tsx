"use client";

import { use, useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";

// ---- Types ------------------------------------------------

interface LivePlayer {
  id: string;
  name: string;
  avatarUrl?: string | null;
  rankTier?: string;
}

interface LiveMatchPlayer {
  userId: string;
  team: number;
  isWinner: boolean;
  user: LivePlayer;
}

interface LiveMatch {
  id: string;
  courtNumber: number;
  team1Score: number;
  team2Score: number;
  status: string;
  startTime: string | null;
  matchType: string;
  players: LiveMatchPlayer[];
}

interface LiveQueueEntry {
  id: string;
  userId: string;
  position: number;
  currentWaitSeconds: number;
  user: LivePlayer;
}

interface LiveStats {
  playerCount: number;
  checkedInCount: number;
}

interface LiveSession {
  id: string;
  title: string;
  shuttlecockUsed: number;
  venue: { name: string; courts: { number: number; status: string }[] };
}

interface LiveData {
  type: "update";
  session: LiveSession;
  activeMatches: LiveMatch[];
  queue: LiveQueueEntry[];
  stats: LiveStats;
}

// ---- Helpers -----------------------------------------------

function teamPlayers(match: LiveMatch, team: number) {
  return match.players.filter((p) => p.team === team).map((p) => p.user.name);
}

function elapsedTime(startTime: string | null): string {
  if (!startTime) return "0s";
  return formatDuration(
    Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
  );
}

// ---- Sub-components ----------------------------------------

function CourtCard({ match }: { match: LiveMatch }) {
  const [elapsed, setElapsed] = useState(() => elapsedTime(match.startTime));

  useEffect(() => {
    const id = setInterval(() => setElapsed(elapsedTime(match.startTime)), 1000);
    return () => clearInterval(id);
  }, [match.startTime]);

  const team1 = teamPlayers(match, 1);
  const team2 = teamPlayers(match, 2);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">Court {match.courtNumber}</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="text-center my-4">
        <div className="text-5xl font-bold font-mono tracking-widest text-white">
          {match.team1Score}
          <span className="text-green-400 mx-3 text-3xl">–</span>
          {match.team2Score}
        </div>
        <div className="text-xs text-green-300 mt-1">⏱ {elapsed}</div>
      </div>

      <div className="flex justify-between text-sm mt-3">
        <div className="text-blue-300">
          <p className="text-xs text-blue-400 mb-1 font-medium">Team A</p>
          {team1.map((n) => (
            <p key={n} className="font-medium">{n}</p>
          ))}
        </div>
        <div className="text-right text-red-300">
          <p className="text-xs text-red-400 mb-1 font-medium">Team B</p>
          {team2.map((n) => (
            <p key={n} className="font-medium">{n}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyCourtCard({ number }: { number: number }) {
  return (
    <div className="rounded-2xl bg-gray-800 border-2 border-gray-700 p-5 flex flex-col items-center justify-center min-h-[180px]">
      <h2 className="text-lg font-bold text-gray-400 mb-2">Court {number}</h2>
      <span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-400">ว่าง</span>
    </div>
  );
}

// ---- Main page ----------------------------------------------

export default function LiveDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<LiveData | null>(null);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // SSE connection
  useEffect(() => {
    const es = new EventSource(`/api/sessions/${id}/live`);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const parsed: LiveData = JSON.parse(e.data);
        if (parsed.type === "update") setData(parsed);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, [id]);

  const clockStr = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-4 animate-pulse">🏸</div>
          <p className="text-lg">กำลังเชื่อมต่อ...</p>
        </div>
      </div>
    );
  }

  const { session, activeMatches, queue, stats } = data;

  // All court numbers for the venue
  const venueCourts = session.venue.courts.map((c) => c.number).sort((a, b) => a - b);
  const activeCourNums = new Set(activeMatches.map((m) => m.courtNumber));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{session.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {session.venue.name} &nbsp;·&nbsp;
            <span
              className={`inline-flex items-center gap-1 ${
                connected ? "text-green-400" : "text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {connected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-mono tabular-nums">{clockStr}</div>
          <div className="text-sm text-gray-400 mt-1">
            👥 {stats.checkedInCount}/{stats.playerCount} คน &nbsp;|&nbsp; 🏸 {session.shuttlecockUsed} ลูก
          </div>
        </div>
      </div>

      {/* Courts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {venueCourts.length > 0 ? (
          venueCourts.map((num) => {
            const match = activeMatches.find((m) => m.courtNumber === num);
            return match ? (
              <CourtCard key={num} match={match} />
            ) : (
              <EmptyCourtCard key={num} number={num} />
            );
          })
        ) : (
          // If no venue courts defined, show active matches only
          activeMatches.length > 0 ? (
            activeMatches.map((m) => <CourtCard key={m.id} match={m} />)
          ) : (
            <div className="col-span-full rounded-2xl bg-gray-800 border-2 border-gray-700 p-8 text-center text-gray-500">
              ยังไม่มีแมตช์ที่กำลังเล่น
            </div>
          )
        )}

        {/* Show extra active-match courts not in venue list */}
        {activeMatches
          .filter((m) => !activeCourNums.has(m.courtNumber) || venueCourts.length === 0)
          .map((m) =>
            venueCourts.length === 0 ? null : <CourtCard key={m.id} match={m} />
          )}
      </div>

      {/* Queue */}
      <div className="rounded-2xl bg-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            ⏳ คิวรอ
            {queue.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-700 px-2.5 py-0.5 text-sm font-normal text-gray-300">
                {queue.length} คน
              </span>
            )}
          </h2>
        </div>

        {queue.length === 0 ? (
          <p className="text-sm text-gray-500">ไม่มีผู้เล่นในคิว</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {queue.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl bg-gray-700 px-4 py-3 min-w-[140px]"
              >
                <span className="text-lg font-bold text-gray-400 tabular-nums w-5 shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium leading-tight">{entry.user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    รอ {formatDuration(entry.currentWaitSeconds)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
