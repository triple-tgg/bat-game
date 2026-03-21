"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🏸</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
          </h1>
        </div>

        {/* LINE Login */}
        <button className="w-full rounded-lg bg-[#06C755] px-4 py-3 text-white font-medium hover:bg-[#05b04d] transition-colors mb-4">
          เข้าสู่ระบบด้วย LINE
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">หรือ</span>
          </div>
        </div>

        {/* Phone Login */}
        <form className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="ชื่อของคุณ"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทร
            </label>
            <input
              type="tel"
              className="input w-full"
              placeholder="0812345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">
            {mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              ยังไม่มีบัญชี?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ลงทะเบียน
              </button>
            </>
          ) : (
            <>
              มีบัญชีแล้ว?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
