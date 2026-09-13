"use client";

import { useEffect, useState, useCallback } from "react";

interface LiveStatusCardProps {
  distanceToNextStop: number;
  nextStopName: string;
  delayMinutes: number;
  currentSpeed: number;
  lastUpdatedAt: number;
  onRefresh?: () => void;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export default function LiveStatusCard({
  distanceToNextStop,
  nextStopName,
  delayMinutes,
  currentSpeed,
  lastUpdatedAt,
  onRefresh,
}: LiveStatusCardProps) {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(lastUpdatedAt));

  const refreshTimeAgo = useCallback(() => {
    setTimeAgo(formatTimeAgo(lastUpdatedAt));
  }, [lastUpdatedAt]);

  useEffect(() => {
    refreshTimeAgo();
    const interval = setInterval(refreshTimeAgo, 10_000);
    return () => clearInterval(interval);
  }, [refreshTimeAgo]);

  const isOnTime = delayMinutes <= 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Top row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-sm font-semibold text-gray-900">Live Status</span>
      </div>

      {/* Middle row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {distanceToNextStop.toFixed(1)} km
          </p>
          <p className="text-sm text-gray-500">to {nextStopName}</p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            isOnTime
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isOnTime ? "On Time" : `Delayed by ${delayMinutes} min${delayMinutes === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">Speed: {currentSpeed} km/h</span>
          <span className="text-xs text-gray-400">Updated {timeAgo}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
