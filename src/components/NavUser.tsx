"use client";
import { useSession, signOut } from "next-auth/react";

export function NavUser() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/profile" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
          {session.user.name ?? "โปรไฟล์"}
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-secondary text-sm"
        >
          ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href="/profile" className="btn-secondary text-sm">โปรไฟล์</a>
      <a href="/login" className="btn-primary text-sm">เข้าสู่ระบบ</a>
    </div>
  );
}
