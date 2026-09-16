"use client";

import { useMemo, useRef, useEffect } from "react";

interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface BusRouteIndicatorProps {
  route: RouteStop[];
  currentStopIndex: number;
  nextStopIndex: number;
  busNumber?: string;
}

function BusIllustration() {
  return (
    <div className="flex-shrink-0 w-[90px] h-[110px] relative">
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Bus body */}
        <rect x="15" y="25" width="70" height="55" rx="6" fill="#EAB308" />
        <rect x="15" y="25" width="70" height="55" rx="6" fill="url(#busBodyGrad)" />

        {/* Windows */}
        <rect x="20" y="32" width="14" height="16" rx="2" fill="#BFDBFE" />
        <rect x="38" y="32" width="14" height="16" rx="2" fill="#BFDBFE" />
        <rect x="56" y="32" width="14" height="16" rx="2" fill="#BFDBFE" />

        {/* Windshield */}
        <rect x="74" y="32" width="8" height="16" rx="2" fill="#93C5FD" />

        {/* Door */}
        <rect x="20" y="54" width="10" height="22" rx="1" fill="#CA8A04" />
        <line x1="25" y1="54" x2="25" y2="76" stroke="#A16207" strokeWidth="1" />

        {/* Lower body */}
        <rect x="15" y="72" width="70" height="8" fill="#B45309" />

        {/* Headlights */}
        <rect x="82" y="42" width="4" height="6" rx="1" fill="#FEF3C7" />
        <rect x="82" y="52" width="4" height="6" rx="1" fill="#EF4444" />

        {/* Wheels */}
        <circle cx="30" cy="85" r="8" fill="#1F2937" />
        <circle cx="30" cy="85" r="4" fill="#6B7280" />
        <circle cx="70" cy="85" r="8" fill="#1F2937" />
        <circle cx="70" cy="85" r="4" fill="#6B7280" />

        {/* Roof rack */}
        <rect x="20" y="18" width="60" height="8" rx="2" fill="#92400E" />

        {/* Route number plate */}
        <rect x="20" y="8" width="35" height="12" rx="2" fill="#FDE68A" />
        <text x="37" y="17" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#92400E">ROUTE</text>

        <defs>
          <linearGradient id="busBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function BusRouteIndicator({ route, currentStopIndex, nextStopIndex, busNumber }: BusRouteIndicatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleStops = useMemo(() => {
    if (route.length === 0) return [];
    const start = Math.max(0, currentStopIndex - 1);
    const end = Math.min(route.length, currentStopIndex + 7);
    return route.slice(start, end).map((stop, i) => ({
      ...stop,
      globalIndex: start + i,
    }));
  }, [route, currentStopIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentStopIndex]);

  if (route.length === 0) return null;

  const progress = route.length > 1 ? (currentStopIndex / (route.length - 1)) * 100 : 0;

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border-4 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Metallic frame top */}
      <div className="h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300" />

      {/* Main content */}
      <div className="bg-white p-3">
        <div className="flex items-stretch gap-2">
          {/* Bus illustration */}
          <BusIllustration />

          {/* Route display */}
          <div className="flex-1 min-w-0">
            {/* Route number plate */}
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-400 px-3 py-1 rounded border-2 border-amber-600">
                <span className="text-sm font-bold text-amber-900">
                  {busNumber || "RMG 1462"}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">
                Stop {currentStopIndex + 1} of {route.length}
              </div>
            </div>

            {/* Route line container */}
            <div ref={scrollRef} className="overflow-x-auto pb-1 scrollbar-hide">
              <div className="min-w-max px-2">
                {/* Top labels row */}
                <div className="flex items-end gap-0 h-14 mb-1">
                  {visibleStops.map((stop, i) => {
                    const isPassed = stop.globalIndex < currentStopIndex;
                    const isCurrent = stop.globalIndex === currentStopIndex;
                    const isNext = stop.globalIndex === nextStopIndex;
                    const isAbove = i % 2 === 0;

                    return (
                      <div
                        key={stop.stopId}
                        className="flex-1 min-w-[65px] flex flex-col items-center"
                        data-active={isCurrent ? "true" : "false"}
                      >
                        {isAbove ? (
                          <div className="text-center mb-1">
                            {isCurrent && (
                              <div className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded mb-0.5">
                                UPCOMING
                              </div>
                            )}
                            {isNext && !isCurrent && (
                              <div className="bg-amber-400 text-amber-900 text-[8px] font-bold px-1.5 py-0.5 rounded mb-0.5">
                                NEXT
                              </div>
                            )}
                            <p className={`text-[9px] font-bold leading-tight truncate max-w-[65px] ${
                              isCurrent ? "text-emerald-600" : isPassed ? "text-red-500" : "text-gray-600"
                            }`}>
                              {stop.name}
                            </p>
                          </div>
                        ) : (
                          <div className="h-6" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Route line with stop markers */}
                <div className="relative px-1 h-8 flex items-center">
                  {/* Background line (remaining route) */}
                  <div className="absolute left-2 right-2 h-3 bg-gray-200 rounded-full" />

                  {/* Completed route line */}
                  <div
                    className="absolute left-2 h-3 bg-red-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(progress + 5, 100)}%`, maxWidth: "calc(100% - 16px)" }}
                  />

                  {/* Stop markers */}
                  <div className="relative flex items-center justify-between w-full px-1">
                    {visibleStops.map((stop, i) => {
                      const isPassed = stop.globalIndex < currentStopIndex;
                      const isCurrent = stop.globalIndex === currentStopIndex;
                      const isNext = stop.globalIndex === nextStopIndex;

                      return (
                        <div
                          key={stop.stopId}
                          className="relative flex items-center justify-center"
                          style={{ minWidth: "18px" }}
                        >
                          {isCurrent ? (
                            <div className="relative">
                              <div className="absolute -inset-2 bg-emerald-400/40 rounded-full animate-pulse" />
                              <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10 relative flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                            </div>
                          ) : isPassed ? (
                            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white shadow-sm" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom labels row */}
                <div className="flex items-start gap-0 h-14 mt-1">
                  {visibleStops.map((stop, i) => {
                    const isPassed = stop.globalIndex < currentStopIndex;
                    const isCurrent = stop.globalIndex === currentStopIndex;
                    const isNext = stop.globalIndex === nextStopIndex;
                    const isAbove = i % 2 === 0;

                    return (
                      <div
                        key={stop.stopId}
                        className="flex-1 min-w-[65px] flex flex-col items-center"
                      >
                        {!isAbove ? (
                          <div className="text-center mt-1">
                            {isCurrent && (
                              <div className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded mb-0.5">
                                UPCOMING
                              </div>
                            )}
                            {isNext && !isCurrent && (
                              <div className="bg-amber-400 text-amber-900 text-[8px] font-bold px-1.5 py-0.5 rounded mb-0.5">
                                NEXT
                              </div>
                            )}
                            <p className={`text-[9px] font-bold leading-tight truncate max-w-[65px] ${
                              isCurrent ? "text-emerald-600" : isPassed ? "text-red-500" : "text-gray-600"
                            }`}>
                              {stop.name}
                            </p>
                          </div>
                        ) : (
                          <div className="h-6" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[9px] text-gray-600 font-medium">Completed ({currentStopIndex})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-gray-600 font-medium">Upcoming ({route.length - currentStopIndex - 1})</span>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 font-medium">
          {route.length} stops
        </div>
      </div>

      {/* Metallic frame bottom */}
      <div className="h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300" />
    </div>
  );
}
