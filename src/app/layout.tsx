import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BadmintonHub - ระบบจัดการก๊วนแบดมินตัน",
  description: "ระบบจัดการก๊วนแบดมินตัน จัดคิว จัดแร้งค์ จัดการเงิน",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <div className="min-h-screen">
          <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <span className="text-2xl">🏸</span>
                  <span className="text-xl font-bold text-primary-600">
                    BadmintonHub
                  </span>
                </a>
                <div className="hidden md:flex items-center gap-6">
                  <a href="/sessions" className="text-sm text-gray-600 hover:text-gray-900">
                    กิจกรรม
                  </a>
                  <a href="/rankings" className="text-sm text-gray-600 hover:text-gray-900">
                    อันดับ
                  </a>
                  <a href="/finance" className="text-sm text-gray-600 hover:text-gray-900">
                    การเงิน
                  </a>
                  <a href="/venues" className="text-sm text-gray-600 hover:text-gray-900">
                    สนาม
                  </a>
                  <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                    Admin
                  </a>
                  <a href="/profile" className="btn-secondary text-sm">
                    โปรไฟล์
                  </a>
                  <a href="/login" className="btn-primary">
                    เข้าสู่ระบบ
                  </a>
                </div>
                {/* Mobile menu */}
                <div className="flex md:hidden items-center gap-2">
                  <a href="/sessions" className="btn-secondary text-xs px-2 py-1">กิจกรรม</a>
                  <a href="/login" className="btn-primary text-xs px-2 py-1">เข้าสู่ระบบ</a>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
