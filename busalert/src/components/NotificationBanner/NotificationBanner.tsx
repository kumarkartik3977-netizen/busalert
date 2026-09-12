"use client";

import { useState, useEffect } from "react";
import { calculateETA } from "../lib/eta";

interface NotificationBannerProps {
  busEta: number;
  studentWalkingTime: number;
}

export default function NotificationBanner({ busEta, studentWalkingTime }: NotificationBannerProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");

  useEffect(() => {
    if (busEta <= 2) {
      setNotificationType("success");
      setNotificationMessage(`🚌 Your bus is arriving at your stop.`);
      setShowNotification(true);
    } else if (busEta <= 10) {
      setNotificationType("info");
      setNotificationMessage(`🚌 Your bus is ${busEta} minutes away.`);
      setShowNotification(true);
    } else if (busEta <= studentWalkingTime + 2) {
      setNotificationType("warning");
      setNotificationMessage(`🚨 Leave now! Your bus is approaching.`);
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [busEta, studentWalkingTime]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  if (!showNotification) return null;

  return (
    <div className={`p-3 rounded-xl mb-4 border-l-4 ${notificationType === "success" ? "bg-green-100 text-green-800 border-green-400" : notificationType === "warning" ? "bg-red-100 text-red-800 border-red-400" : "bg-blue-100 text-blue-800 border-blue-400"}`}>
      <div className="flex items-start">
        <span className="text-2xl flex-shrink-0">{notificationType === "warning" ? "🚨" : notificationType === "success" ? "🚌" : "🔔"}</span>
        <div className="flex-1 pl-3">
          <p className="font-medium truncate">{notificationMessage}</p>
        </div>
      </div>
    </div>
  );
}