"use client";

import { useState, useEffect, useMemo } from "react";

interface NotificationBannerProps {
  busEta: number;
  studentWalkingTime: number;
}

export default function NotificationBanner({ busEta, studentWalkingTime }: NotificationBannerProps) {
  const [dismissedAt, setDismissedAt] = useState(0);

  const { show, type, message } = useMemo(() => {
    if (busEta <= 2) {
      return { show: true, type: "success", message: "🚌 Your bus is arriving at your stop." };
    } else if (busEta <= 10) {
      return { show: true, type: "info", message: `🚌 Your bus is ${busEta} minutes away.` };
    } else if (busEta <= studentWalkingTime + 2) {
      return { show: true, type: "warning", message: "🚨 Leave now! Your bus is approaching." };
    }
    return { show: false, type: "info", message: "" };
  }, [busEta, studentWalkingTime]);

  useEffect(() => {
    if (show && dismissedAt === 0) {
      const timer = setTimeout(() => setDismissedAt(Date.now()), 8000);
      return () => clearTimeout(timer);
    }
  }, [show, dismissedAt]);

  const isDismissed = dismissedAt > 0;

  if (!show || isDismissed) return null;

  return (
    <div className={`p-3 rounded-xl mb-4 border-l-4 ${type === "success" ? "bg-green-100 text-green-800 border-green-400" : type === "warning" ? "bg-red-100 text-red-800 border-red-400" : "bg-blue-100 text-blue-800 border-blue-400"}`}>
      <div className="flex items-start">
        <span className="text-2xl flex-shrink-0">{type === "warning" ? "🚨" : type === "success" ? "🚌" : "🔔"}</span>
        <div className="flex-1 pl-3">
          <p className="font-medium truncate">{message}</p>
        </div>
      </div>
    </div>
  );
}
