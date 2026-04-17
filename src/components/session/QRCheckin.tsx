"use client";

import { useEffect, useRef } from "react";

interface QRCheckinProps {
  sessionId: string;
  shareToken: string;
  size?: number;
}

export function QRCheckin({ sessionId, shareToken, size = 200 }: QRCheckinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${shareToken}`
    : `/join/${shareToken}`;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically import qrcode to avoid SSR issues
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, joinUrl, {
        width: size,
        margin: 2,
        color: { dark: "#1e3a8a", light: "#ffffff" },
      });
    });
  }, [joinUrl, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-xl border border-gray-200 shadow-sm" />
      <div className="text-center">
        <p className="text-xs text-gray-500">สแกน QR เพื่อลงชื่อเข้าร่วม</p>
        <p className="font-mono text-sm text-primary-600 mt-1">{shareToken}</p>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(joinUrl)}
        className="btn-secondary text-xs px-3 py-1"
      >
        📋 คัดลอกลิงก์
      </button>
    </div>
  );
}
