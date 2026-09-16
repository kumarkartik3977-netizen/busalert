"use client";

import { useMemo } from "react";

interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface RouteProgressTimelineProps {
  route: RouteStop[];
  currentStopIndex: number;
  nextStopIndex: number;
  speed?: number;
  etaMinutes?: number;
}

export default function RouteProgressTimeline({
  route,
  currentStopIndex,
  nextStopIndex,
  speed = 0,
  etaMinutes = 0,
}: RouteProgressTimelineProps) {
  const progress = useMemo(() => {
    if (route.length < 2) return 0;
    return (currentStopIndex / (route.length - 1)) * 100;
  }, [route.length, currentStopIndex]);

  const busLeftPercent = useMemo(() => {
    if (route.length < 2) return 0;
    const segmentSize = 100 / (route.length - 1);
    const segmentProgress = (etaMinutes > 0 && speed > 0) ? 0.5 : 0;
    return Math.min(
      currentStopIndex * segmentSize + segmentSize * segmentProgress,
      100
    );
  }, [route.length, currentStopIndex, speed, etaMinutes]);

  if (route.length === 0) return null;

  const firstStop = route[0];
  const lastStop = route[route.length - 1];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Route Progress</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Passed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            <span className="text-gray-600">Current</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-gray-400 bg-white" />
            <span className="text-gray-600">Upcoming</span>
          </span>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="relative mb-6">
        {/* Background track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Completed fill */}
          <div
            className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bus indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
          style={{ left: `${busLeftPercent}%` }}
        >
          {/* Glow ring */}
          <div className="absolute -inset-2 rounded-full bg-blue-400/20 animate-pulse" />
          {/* Bus icon */}
          <div className="relative -ml-3 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white shadow-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="14" rx="2" />
              <path d="M3 10h18" />
              <circle cx="7" cy="15" r="1" fill="white" stroke="none" />
              <circle cx="17" cy="15" r="1" fill="white" stroke="none" />
            </svg>
          </div>
        </div>

        {/* Stop dots on timeline */}
        {route.map((stop, i) => {
          const isPassed = i < currentStopIndex;
          const isCurrent = i === currentStopIndex;
          const isUpcoming = i > currentStopIndex;
          const leftPercent = route.length > 1 ? (i / (route.length - 1)) * 100 : 0;

          return (
            <div
              key={stop.stopId}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${leftPercent}%` }}
            >
              {isCurrent ? (
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md progress-dot-active" />
                </div>
              ) : isPassed ? (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />
              ) : (
                <div className="w-2 h-2 rounded-full border border-gray-400 bg-white" />
              )}
            </div>
          );
        })}
      </div>

      {/* Route endpoints */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
          <div>
            <p className="text-xs text-gray-500">Start</p>
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{firstStop.name}</p>
          </div>
        </div>

        <div className="flex-1 mx-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {Math.round(progress)}%
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-500 text-right">End</p>
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px] text-right">{lastStop.name}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-4 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{currentStopIndex}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Passed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{currentStopIndex + 1}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Current</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-400">{route.length - currentStopIndex - 1}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Remaining</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{route.length}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
        </div>
      </div>
    </div>
  );
}
