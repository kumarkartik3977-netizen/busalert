"use client";

import { useState } from "react";

interface StatusBadgeProps {
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE" | "ARRIVING";
  busNumber?: string;
}

export default function StatusBadge({ status, busNumber }: StatusBadgeProps) {
  const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
    ON_ROUTE: { label: "On Route", color: "green-600", icon: "🟢" },
    DELAYED: { label: "Delayed", color: "orange-600", icon: "🟡" },
    OFFLINE: { label: "Offline", color: "gray-500", icon: "⚫" },
    ARRIVING: { label: "Arriving", color: "blue-600", icon: "🚌" },
  };

  const label = statusLabels[status] || statusLabels.OFFLINE;

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-medium`}>
      <span className={`text-${statusLabels[status]?.color === "green-600" ? "green-800" : statusLabels[status]?.color === "orange-600" ? "orange-800" : "gray-700"}`>
        {label}
      </span>
    </span>
  );
}