"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/utils";

const MOCK_QUEUE = [
  { id: "1", name: "สมชาย", waitSeconds: 720, roundsPlayed: 3, rankTier: "DIAMOND" },
  { id: "2", name: "สมหญิง", waitSeconds: 540, roundsPlayed: 2, rankTier: "PLATINUM" },
  { id: "3", name: "วิชัย", waitSeconds: 420, roundsPlayed: 2, rankTier: "GOLD" },
  { id: "4", name: "พรทิพย์", waitSeconds: 300, roundsPlayed: 1, rankTier: "SILVER" },
  { id: "5", name: "อดิศร", waitSeconds: 180, roundsPlayed: 1, rankTier: "BRONZE" },
];

const MOCK_COURTS = [
  {
    number: 1,
    status: "IN_USE",
    team1: ["สมชาย", "วิชัย"],
    team2: ["สมหญิง", "พรทิพย์"],
    score: "15 - 12",
  },
  {
    number: 2,
    status: "IN_USE",
    team1: ["อดิศร", "มานะ"],
    team2: ["ปิยะ", "นภา"],
    score: "8 - 11",
  },
  { number: 3, status: "AVAILABLE", team1: [], team2: [], score: "" },
];

const RANK_BADGE: Record<string, string> = {
  DIAMOND: "badge-diamond",
  PLATINUM: "badge-platinum",
  GOLD: "badge-gold",
  SILVER: "badge-silver",
  BRONZE: "badge-bronze",
};

export default function SessionDetailPage() {
  const [activeTab, setActiveTab] = useState<"courts" | "queue" | "matches" | "expenses">("courts");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Session Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              แบดมินตันวันอังคาร
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📅 2026-03-24</span>
              <span>🕐 18:00 - 21:00</span>
              <span>📍 สนามแบดมินตัน A (3 คอร์ท)</span>
              <span>👥 12/20 คน</span>
              <span>💰 150 บาท/คน</span>
              <span>🏸 ลูกที่ใช้: 8 ลูก</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">เช็คอิน</button>
            <a href="live" className="btn-secondary">
              📺 Live
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-1">🎲</div>
          <div className="text-sm font-medium">สุ่มจัดคู่</div>
        </button>
        <button className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-sm font-medium">ส่งลิงก์ลงชื่อ</div>
        </button>
        <button className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-sm font-medium">เพิ่มค่าใช้จ่าย</div>
        </button>
        <button className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-medium">จบกิจกรรม</div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: "courts", label: "สนาม" },
          { key: "queue", label: "คิวรอ" },
          { key: "matches", label: "รอบการเล่น" },
          { key: "expenses", label: "ค่าใช้จ่าย" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courts View */}
      {activeTab === "courts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_COURTS.map((court) => (
            <div
              key={court.number}
              className={`card border-2 ${
                court.status === "IN_USE"
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Court {court.number}</h3>
                <span
                  className={`badge ${
                    court.status === "IN_USE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {court.status === "IN_USE" ? "กำลังเล่น" : "ว่าง"}
                </span>
              </div>
              {court.status === "IN_USE" && (
                <>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="text-blue-600 font-medium">
                      {court.team1.join(", ")}
                    </div>
                    <div className="font-bold text-lg">{court.score}</div>
                    <div className="text-red-600 font-medium">
                      {court.team2.join(", ")}
                    </div>
                  </div>
                  <button className="btn-secondary w-full mt-2 text-xs">
                    บันทึกผล
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Queue View */}
      {activeTab === "queue" && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">
            คิวรอ ({MOCK_QUEUE.length} คน)
          </h3>
          <div className="space-y-3">
            {MOCK_QUEUE.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-8">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-gray-900">
                      {player.name}
                    </span>
                    <span className={`badge ml-2 ${RANK_BADGE[player.rankTier]}`}>
                      {player.rankTier}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>⏱️ รอ {formatDuration(player.waitSeconds)}</span>
                  <span>🔄 เล่นแล้ว {player.roundsPlayed} รอบ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches View */}
      {activeTab === "matches" && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">ประวัติรอบการเล่น</h3>
          <p className="text-gray-500 text-sm">รอบการเล่นจะแสดงที่นี่เมื่อเริ่มเล่น</p>
        </div>
      )}

      {/* Expenses View */}
      {activeTab === "expenses" && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">ค่าใช้จ่าย</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span>ค่าสนาม (3 ชม.)</span>
              <span className="font-medium">1,200 บาท</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>ค่าลูกขนไก่ (8 ลูก)</span>
              <span className="font-medium">600 บาท</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>รวม</span>
              <span>1,800 บาท</span>
            </div>
            <div className="flex justify-between py-2 text-primary-600 font-medium">
              <span>ค่าต่อคน (12 คน)</span>
              <span>150 บาท/คน</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
