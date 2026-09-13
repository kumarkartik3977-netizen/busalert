"use client";

interface StatusBadgeProps {
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE" | "ARRIVING";
}

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  ON_ROUTE: { label: "On Route", colorClass: "text-green-800" },
  DELAYED: { label: "Delayed", colorClass: "text-orange-800" },
  OFFLINE: { label: "Offline", colorClass: "text-gray-700" },
  ARRIVING: { label: "Arriving", colorClass: "text-blue-800" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.OFFLINE;

  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-medium">
      <span className={config.colorClass}>
        {config.label}
      </span>
    </span>
  );
}
