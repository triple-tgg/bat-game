import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "แบบร่าง", className: "bg-gray-100 text-gray-600" },
  OPEN: { label: "เปิดรับ", className: "bg-green-100 text-green-700" },
  FULL: { label: "เต็มแล้ว", className: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "กำลังเล่น", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "เสร็จสิ้น", className: "bg-gray-100 text-gray-500" },
  CANCELLED: { label: "ยกเลิก", className: "bg-red-100 text-red-700" },
  UNPAID: { label: "ค้างจ่าย", className: "bg-red-100 text-red-700" },
  PAID: { label: "จ่ายแล้ว", className: "bg-green-100 text-green-700" },
  PARTIAL: { label: "จ่ายบางส่วน", className: "bg-yellow-100 text-yellow-700" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("badge", config.className, className)}>
      {config.label}
    </span>
  );
}
