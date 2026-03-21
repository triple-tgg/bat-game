"use client";

import { useState } from "react";

export default function NewSessionPage() {
  const [isRecurring, setIsRecurring] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">สร้างกิจกรรม</h1>

      <form className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อกิจกรรม *
          </label>
          <input
            type="text"
            className="input w-full"
            placeholder="เช่น แบดมินตันวันอังคาร"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่ *
            </label>
            <input type="date" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สนาม *
            </label>
            <select className="input w-full">
              <option value="">เลือกสนาม</option>
              <option value="1">สนามแบดมินตัน A</option>
              <option value="2">สนามแบดมินตัน B</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เวลาเริ่ม *
            </label>
            <input type="time" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เวลาจบ *
            </label>
            <input type="time" className="input w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนผู้เล่นสูงสุด
            </label>
            <input
              type="number"
              className="input w-full"
              defaultValue={20}
              min={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ค่าใช้จ่ายต่อคน (บาท)
            </label>
            <input
              type="number"
              className="input w-full"
              defaultValue={0}
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              กิจกรรมซ้ำประจำ
            </span>
          </label>
          {isRecurring && (
            <div className="mt-3">
              <select className="input w-full">
                <option value="WEEKLY">ทุกสัปดาห์</option>
                <option value="BIWEEKLY">ทุก 2 สัปดาห์</option>
                <option value="MONTHLY">ทุกเดือน</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            หมายเหตุ
          </label>
          <textarea
            className="input w-full"
            rows={3}
            placeholder="รายละเอียดเพิ่มเติม..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex-1 py-3">
            สร้างกิจกรรม
          </button>
          <a href="/sessions" className="btn-secondary flex-1 py-3 text-center">
            ยกเลิก
          </a>
        </div>
      </form>
    </div>
  );
}
