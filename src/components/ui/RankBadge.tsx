import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  DIAMOND: "badge-diamond",
  PLATINUM: "badge-platinum",
  GOLD: "badge-gold",
  SILVER: "badge-silver",
  BRONZE: "badge-bronze",
};

const LABELS: Record<string, string> = {
  DIAMOND: "💎 Diamond",
  PLATINUM: "🔵 Platinum",
  GOLD: "🟡 Gold",
  SILVER: "⚪ Silver",
  BRONZE: "🟤 Bronze",
};

interface RankBadgeProps {
  tier: string;
  className?: string;
  showIcon?: boolean;
}

export function RankBadge({ tier, className, showIcon = true }: RankBadgeProps) {
  return (
    <span className={cn("badge", STYLES[tier], className)}>
      {showIcon ? LABELS[tier] : tier}
    </span>
  );
}
