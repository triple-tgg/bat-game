"use client";

import { useState } from "react";

export default function JoinSessionPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ลงชื่อสำเร็จ!
          </h1>
          <p className="text-gray-600">
            คุณ {name} ได้ลงชื่อเข้าร่วมกิจกรรมแล้ว
          </p>
          <p className="text-sm text-gray-500 mt-4">
            กรุณามาเช็คอินที่สนามในวันเล่น
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">🏸</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            เข้าร่วมกิจกรรมแบดมินตัน
          </h1>
          <p className="text-gray-600 mt-2">กรอกข้อมูลเพื่อลงชื่อเข้าร่วม</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ *
            </label>
            <input
              type="text"
              required
              className="input w-full"
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทร
            </label>
            <input
              type="tel"
              className="input w-full"
              placeholder="0812345678 (ไม่จำเป็น)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">
            ลงชื่อเข้าร่วม
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          ไม่จำเป็นต้องเป็นสมาชิก กรอกชื่อก็ลงชื่อได้เลย
        </p>
      </div>
    </div>
  );
}
