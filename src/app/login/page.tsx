"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [phone, setPhone] = useState("");
  const [name, setName]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !name) { setError("กรุณากรอกชื่อและเบอร์โทร"); return; }

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      phone,
      name,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  function handleLine() {
    signIn("line", { callbackUrl });
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🏸</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
          <p className="text-sm text-gray-500 mt-1">BadmintonHub</p>
        </div>

        {/* LINE Login */}
        <button
          onClick={handleLine}
          className="w-full rounded-lg bg-[#06C755] px-4 py-3 text-white font-medium hover:bg-[#05b04d] transition-colors mb-4"
        >
          เข้าสู่ระบบด้วย LINE
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">หรือใช้เบอร์โทร</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="input w-full" placeholder="ชื่อของคุณ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
            <input
              type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
              className="input w-full" placeholder="0812345678"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ / ลงทะเบียน"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          ถ้ายังไม่มีบัญชี ระบบจะสร้างให้อัตโนมัติ
        </p>

        {/* Demo accounts */}
        <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">บัญชีสาธิต</p>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>สมชาย (Admin)</span>
              <span className="font-mono">0800000001</span>
            </div>
            <div className="flex justify-between">
              <span>สมหญิง (Platinum)</span>
              <span className="font-mono">0800000002</span>
            </div>
            <div className="flex justify-between">
              <span>อดิศร (Gold)</span>
              <span className="font-mono">0800000005</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
