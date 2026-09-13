"use client";

import type { RouteStop } from "@/types";

interface StopListProps {
  stops: RouteStop[];
  currentStopIndex?: number;
  nextStopIndex?: number;
}

export default function StopList({ stops, currentStopIndex = -1, nextStopIndex = -1 }: StopListProps) {
  if (stops.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-500 text-center">No stops available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-gray-900 mb-4">Bus Stops</h3>
      <div className="space-y-1">
        {stops.map((stop, index) => {
          const isCurrent = index === currentStopIndex;
          const isNext = index === nextStopIndex;
          const isPast = index < currentStopIndex;

          return (
            <div
              key={stop.stopId}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isCurrent
                  ? "bg-green-100 text-green-800"
                  : isNext
                    ? "bg-yellow-100 text-yellow-800"
                    : isPast
                      ? "text-gray-400"
                      : "text-gray-700"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  isCurrent
                    ? "bg-green-500"
                    : isNext
                      ? "bg-yellow-500"
                      : isPast
                        ? "bg-gray-300"
                        : "bg-gray-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isPast ? "line-through" : ""}`}>
                  {stop.name}
                </p>
              </div>
              {isCurrent && (
                <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded">
                  CURRENT
                </span>
              )}
              {isNext && (
                <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                  NEXT
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
