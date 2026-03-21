"use client";

import { formatDuration } from "@/lib/utils";

const MOCK_COURTS = [
  {
    number: 1,
    status: "IN_USE",
    team1: ["สมชาย", "วิชัย"],
    team2: ["สมหญิง", "พรทิพย์"],
    score: "15 - 12",
    elapsed: "12:30",
  },
  {
    number: 2,
    status: "IN_USE",
    team1: ["อดิศร", "มานะ"],
    team2: ["ปิยะ", "นภา"],
    score: "8 - 11",
    elapsed: "08:45",
  },
  { number: 3, status: "AVAILABLE", team1: [], team2: [], score: "", elapsed: "" },
];

const MOCK_QUEUE = [
  { name: "ธนา", waitSeconds: 720 },
  { name: "สุดา", waitSeconds: 540 },
  { name: "กมล", waitSeconds: 420 },
  { name: "วรรณ", waitSeconds: 300 },
];

export default function LiveDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🏸 Live Dashboard</h1>
          <p className="text-gray-400">แบดมินตันวันอังคาร - สนาม A</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono">18:45</div>
          <div className="text-sm text-gray-400">👥 12 คน | 🏸 8 ลูก</div>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {MOCK_COURTS.map((court) => (
          <div
            key={court.number}
            className={`rounded-2xl p-6 ${
              court.status === "IN_USE"
                ? "bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500"
                : "bg-gray-800 border-2 border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Court {court.number}</h2>
              {court.status === "IN_USE" ? (
                <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-medium">
                  LIVE
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-600 rounded-full text-sm">
                  ว่าง
                </span>
              )}
            </div>

            {court.status === "IN_USE" && (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold font-mono tracking-wider">
                    {court.score}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    ⏱️ {court.elapsed}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-blue-300">
                    <div className="font-medium mb-1">Team A</div>
                    {court.team1.map((p) => (
                      <div key={p}>{p}</div>
                    ))}
                  </div>
                  <div className="text-red-300 text-right">
                    <div className="font-medium mb-1">Team B</div>
                    {court.team2.map((p) => (
                      <div key={p}>{p}</div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="rounded-2xl bg-gray-800 p-6">
        <h2 className="text-xl font-bold mb-4">
          ⏳ คิวรอ ({MOCK_QUEUE.length} คน)
        </h2>
        <div className="flex flex-wrap gap-4">
          {MOCK_QUEUE.map((player, index) => (
            <div
              key={player.name}
              className="flex items-center gap-3 rounded-xl bg-gray-700 px-4 py-3"
            >
              <span className="text-lg font-bold text-gray-400">
                {index + 1}
              </span>
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-xs text-gray-400">
                  รอ {formatDuration(player.waitSeconds)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
