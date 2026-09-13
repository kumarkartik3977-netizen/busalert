"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import BusHeader from "@/components/BusHeader/BusHeader";
import StopTimeline from "@/components/StopTimeline/StopTimeline";
import LiveStatusCard from "@/components/StopTimeline/LiveStatusCard";
import { GpsSimulator } from "@/lib/simulation/gpsSimulator";
import { calculateStopETAs, detectGeofenceArrival } from "@/lib/eta/engine";
import { getStopsForBus, DEMO_BUSES, getRouteForBus } from "@/lib/demoData";
import type { BusStop, StopETA, BusLiveStatus } from "@/types";

function formatTime(date: Date | null): string {
  if (!date) return "--:--";
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  if (dateStr === todayStr) return "Today";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.busId as string;

  const simulatorRef = useRef<GpsSimulator | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const speedReadingsRef = useRef<number[]>([]);

  const [stopETAs, setStopETAs] = useState<StopETA[]>([]);
  const [liveStatus, setLiveStatus] = useState<BusLiveStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  const bus = DEMO_BUSES.find((b) => b.busId === busId);
  const route = bus ? getRouteForBus(busId) : undefined;
  const stops: BusStop[] = bus ? getStopsForBus(busId) : [];

  const tick = useCallback(() => {
    const sim = simulatorRef.current;
    if (!sim || stops.length === 0) return;

    const result = sim.tick(15);
    const now = new Date();

    speedReadingsRef.current.push(result.speed);
    if (speedReadingsRef.current.length > 5) {
      speedReadingsRef.current.shift();
    }

    const etas = calculateStopETAs(
      stops,
      result.latitude,
      result.longitude,
      result.speed,
      speedReadingsRef.current,
      now
    );

    const nextStopIdx = result.nextStopIndex;
    const currentStopIdx = result.currentStopIndex;

    let nextStopName = stops[stops.length - 1].stopName;
    let distanceToNext = 0;
    let etaMinutes = 0;

    if (nextStopIdx < stops.length) {
      const nextStop = etas[nextStopIdx];
      nextStopName = nextStop.stopName;
      distanceToNext = nextStop.distanceFromCurrentLocation / 1000;
      etaMinutes = Math.round(distanceToNext / (result.speed > 0 ? result.speed : 25) * 60);
    }

    const lastStop = etas[currentStopIdx] || etas[0];
    const delay = Math.max(0, Math.round(
      (now.getTime() - new Date(`1970-01-01T${lastStop.scheduledArrival}:00`).getTime()) / 60000
    ));

    setStopETAs(etas);
    setLiveStatus({
      busId,
      currentLatitude: result.latitude,
      currentLongitude: result.longitude,
      currentSpeedKmph: Math.round(result.speed),
      lastUpdatedStop: lastStop.stopName,
      nextStop: nextStopName,
      distanceToNextStop: parseFloat(distanceToNext.toFixed(1)),
      estimatedArrivalAtNextStop: etaMinutes,
      delayInMinutes: delay,
      lastUpdatedAt: Date.now(),
      speedReadings: [...speedReadingsRef.current],
    });
  }, [busId, stops]);

  useEffect(() => {
    if (!bus || stops.length === 0) {
      setLoading(false);
      return;
    }

    const coords = stops.map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
    }));

    simulatorRef.current = new GpsSimulator(coords, 30);
    setIsSimulating(true);

    tick();

    intervalRef.current = setInterval(() => {
      tick();
    }, 15000);

    setLoading(false);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      simulatorRef.current = null;
    };
  }, [bus, stops, tick]);

  const handleRefresh = useCallback(() => {
    tick();
  }, [tick]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (!bus || !route) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusHeader busNumber="--" routeName="Unknown Route" onBack={() => router.back()} />
        <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20">
          <div className="rounded-full bg-red-100 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Bus Not Found</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Bus &quot;{busId}&quot; does not exist or is not available for tracking.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <BusHeader
        busNumber={bus.busNumber}
        routeName={route.name}
        onBack={() => router.back()}
      />

      <div className="mx-auto max-w-lg space-y-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateLabel(selectedDate)} ▾
          </button>
          {isSimulating && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live
            </div>
          )}
        </div>

        {liveStatus && (
          <LiveStatusCard
            distanceToNextStop={liveStatus.distanceToNextStop}
            nextStopName={liveStatus.nextStop}
            delayMinutes={liveStatus.delayInMinutes}
            currentSpeed={liveStatus.currentSpeedKmph}
            lastUpdatedAt={liveStatus.lastUpdatedAt}
            onRefresh={handleRefresh}
          />
        )}

        <StopTimeline stops={stopETAs} />
      </div>

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {liveStatus && (
                <>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wide">Next Stop</span>
                    <span className="text-sm font-semibold text-gray-900">{liveStatus.nextStop}</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wide">ETA</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {liveStatus.estimatedArrivalAtNextStop} min
                    </span>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      liveStatus.delayInMinutes <= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {liveStatus.delayInMinutes <= 0
                      ? "On Time"
                      : `${liveStatus.delayInMinutes}m late`}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">
                {liveStatus ? formatTime(new Date(liveStatus.lastUpdatedAt)) : ""}
              </span>
              <button
                onClick={handleRefresh}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
