"use client";

import { useState, useEffect, use } from "react";
import { formatCurrency } from "@/lib/utils";

interface SessionInfo {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  costPerPerson: number;
  notes: string | null;
  isFull: boolean;
  spotsLeft: number;
  venue: { name: string; address: string | null };
  _count: { players: number };
}

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "gone" }
  | { phase: "form"; session: SessionInfo }
  | { phase: "success"; name: string };

export default function JoinSessionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [state, setState] = useState<State>({ phase: "loading" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/share/${token}`)
      .then(async (res) => {
        if (res.status === 404) {
          setState({ phase: "error", message: "ไม่พบลิงก์นี้" });
        } else if (res.status === 410) {
          setState({ phase: "gone" });
        } else if (!res.ok) {
          setState({ phase: "error", message: "เกิดข้อผิดพลาด" });
        } else {
          const session: SessionInfo = await res.json();
          setState({ phase: "form", session });
        }
      })
      .catch(() => setState({ phase: "error", message: "ไม่สามารถเชื่อมต่อได้" }));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.phase !== "form") return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${state.session.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: name, guestPhone: phone || undefined }),
      });

      if (res.ok) {
        setState({ phase: "success", name });
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch {
      alert("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (state.phase === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4 animate-pulse">🏸</div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">ไม่พบลิงก์</h1>
          <p className="text-gray-500">{state.message}</p>
        </div>
      </div>
    );
  }

  if (state.phase === "gone") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            กิจกรรมสิ้นสุดแล้ว
          </h1>
          <p className="text-gray-500">
            ลิงก์นี้ไม่รับสมัครแล้ว กรุณาติดต่อผู้จัดกิจกรรม
          </p>
        </div>
      </div>
    );
  }

  if (state.phase === "success") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ลงชื่อสำเร็จ!</h1>
          <p className="text-gray-600">
            คุณ <span className="font-semibold">{state.name}</span> ได้ลงชื่อเข้าร่วมแล้ว
          </p>
          <p className="text-sm text-gray-400 mt-4">
            กรุณามาเช็คอินที่สนามในวันเล่น
          </p>
        </div>
      </div>
    );
  }

  // phase === "form"
  const { session } = state;
  const gameDate = new Date(session.date).toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const startTime = new Date(session.startTime).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(session.endTime).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        {/* Session info card */}
        <div className="card">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🏸</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {session.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{session.venue.name}</p>
              {session.venue.address && (
                <p className="text-xs text-gray-400">{session.venue.address}</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">วันที่</p>
              <p className="font-medium text-gray-900">{gameDate}</p>
            </div>
            <div>
              <p className="text-gray-500">เวลา</p>
              <p className="font-medium text-gray-900">{startTime} – {endTime}</p>
            </div>
            <div>
              <p className="text-gray-500">ผู้เล่น</p>
              <p className="font-medium text-gray-900">
                {session._count.players}/{session.maxPlayers} คน
              </p>
            </div>
            <div>
              <p className="text-gray-500">ค่าสนาม</p>
              <p className="font-medium text-gray-900">
                {session.costPerPerson > 0
                  ? formatCurrency(session.costPerPerson)
                  : "คำนวณหลังจบ"}
              </p>
            </div>
          </div>

          {session.notes && (
            <p className="mt-3 text-sm text-gray-500 border-t border-gray-100 pt-3">
              {session.notes}
            </p>
          )}

          {session.isFull && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
              ⚠️ กิจกรรมเต็มแล้ว แต่ยังลงชื่อสำรองได้
            </div>
          )}
          {!session.isFull && (
            <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              ✅ ยังมีที่ว่าง {session.spotsLeft} ที่นั่ง
            </div>
          )}
        </div>

        {/* Registration form */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            กรอกข้อมูลเพื่อลงชื่อ
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="0812345678 (ไม่จำเป็น)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "กำลังส่ง..." : "ลงชื่อเข้าร่วม"}
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-gray-400">
            ไม่ต้องสมัครสมาชิก — กรอกชื่อแล้วลงชื่อได้เลย
          </p>
        </div>
      </div>
    </div>
  );
}
