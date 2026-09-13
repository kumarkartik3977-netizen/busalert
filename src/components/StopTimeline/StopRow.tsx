"use client";

interface StopRowProps {
  stopName: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  estimatedArrival: string | null;
  actualArrival: string | null;
  estimatedDeparture: string | null;
  actualDeparture: string | null;
  delayMinutes: number;
  distanceFromStart: number;
  platformNo?: string;
  status: "passed" | "current" | "upcoming";
  isLast: boolean;
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function TimeDisplay({
  scheduled,
  actual,
  estimated,
  status,
  delayMinutes,
}: {
  scheduled: string;
  actual: string | null;
  estimated: string | null;
  status: "passed" | "current" | "upcoming";
  delayMinutes: number;
}) {
  const displayTime =
    status === "passed"
      ? actual
      : estimated ?? scheduled;

  const isDelayed = delayMinutes > 0;
  const isEarly = delayMinutes < 0;

  return (
    <div className="flex flex-col items-end text-right">
      <span className="text-xs text-gray-400">{scheduled}</span>
      <span
        className={`text-sm font-semibold ${
          status === "passed" || status === "current"
            ? isDelayed
              ? "text-red-500"
              : isEarly
                ? "text-green-500"
                : "text-green-600"
            : "text-gray-500"
        }`}
      >
        {displayTime}
      </span>
      {status === "current" && isDelayed && (
        <span className="text-[10px] text-red-500">+{delayMinutes} min</span>
      )}
    </div>
  );
}

export default function StopRow({
  stopName,
  scheduledArrival,
  scheduledDeparture,
  estimatedArrival,
  actualArrival,
  estimatedDeparture,
  actualDeparture,
  delayMinutes,
  distanceFromStart,
  platformNo,
  status,
  isLast,
}: StopRowProps) {
  return (
    <div
      className={`relative grid grid-cols-[80px_1fr_80px] items-center gap-2 min-h-[60px] px-2 ${
        status === "current"
          ? "bg-blue-50/80 rounded-lg -mx-1"
          : ""
      }`}
    >
      {/* Left column — Arrival */}
      <TimeDisplay
        scheduled={scheduledArrival}
        actual={actualArrival}
        estimated={estimatedArrival}
        status={status}
        delayMinutes={delayMinutes}
      />

      {/* Center column — Timeline dot + stop info */}
      <div className="relative flex items-center gap-3">
        {/* Vertical connector line */}
        {!isLast && (
          <div
            className={`absolute left-[9px] top-[24px] w-[2px] h-[calc(100%+8px)] ${
              status === "passed" ? "bg-green-500" : "bg-gray-200"
            }`}
          />
        )}

        {/* Dot marker */}
        {status === "passed" && (
          <div className="relative z-10 w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
        )}
        {status === "current" && (
          <div className="relative z-10 flex-shrink-0">
            <div className="absolute -inset-1 rounded-full bg-blue-500/20 animate-pulse" />
            <div className="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow" />
          </div>
        )}
        {status === "upcoming" && (
          <div className="relative z-10 w-3 h-3 rounded-full border-2 border-gray-400 bg-white flex-shrink-0" />
        )}

        {/* Stop info */}
        <div className="min-w-0">
          <p
            className={`text-sm font-bold truncate ${
              status === "passed"
                ? "text-gray-900"
                : status === "current"
                  ? "text-blue-600"
                  : "text-gray-700"
            }`}
          >
            {stopName}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>{formatDistance(distanceFromStart)}</span>
            {platformNo && <span>Pg {platformNo}</span>}
          </div>
        </div>
      </div>

      {/* Right column — Departure */}
      <TimeDisplay
        scheduled={scheduledDeparture}
        actual={actualDeparture}
        estimated={estimatedDeparture}
        status={status}
        delayMinutes={delayMinutes}
      />
    </div>
  );
}
