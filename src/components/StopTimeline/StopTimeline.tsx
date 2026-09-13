"use client";

import StopRow from "./StopRow";

interface StopETAData {
  stopId: string;
  stopName: string;
  sequence: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  estimatedArrival: Date | null;
  actualArrival: Date | null;
  estimatedDeparture: Date | null;
  actualDeparture: Date | null;
  delayMinutes: number;
  distanceFromStart: number;
  platformNo?: string;
  status: "passed" | "current" | "upcoming";
}

interface StopTimelineProps {
  stops: StopETAData[];
}

function formatTime(date: Date | null): string | null {
  if (!date) return null;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours.toString().padStart(2, "0")}:${paddedMinutes} ${period}`;
}

export default function StopTimeline({ stops }: StopTimelineProps) {
  const sorted = [...stops].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
        <span>Arrival</span>
        <span>Stop Name & Details</span>
        <span className="text-right">Departure</span>
      </div>
      {sorted.map((stop, index) => (
        <StopRow
          key={stop.stopId}
          stopName={stop.stopName}
          scheduledArrival={stop.scheduledArrival}
          scheduledDeparture={stop.scheduledDeparture}
          estimatedArrival={formatTime(stop.estimatedArrival)}
          actualArrival={formatTime(stop.actualArrival)}
          estimatedDeparture={formatTime(stop.estimatedDeparture)}
          actualDeparture={formatTime(stop.actualDeparture)}
          delayMinutes={stop.delayMinutes}
          distanceFromStart={stop.distanceFromStart}
          platformNo={stop.platformNo}
          status={stop.status}
          isLast={index === sorted.length - 1}
        />
      ))}
    </div>
  );
}
