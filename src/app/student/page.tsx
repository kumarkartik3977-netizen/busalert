"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { calculateETA } from "@/lib/eta";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { DEMO_BUSES, DEMO_ROUTES, DEMO_STOPS, DEMO_SCHEDULE, getRouteForBus } from "@/lib/demoData";
import { generateNotifications } from "@/lib/notifications";
import ETACard from "@/components/ETACard/ETACard";
import NotificationBanner from "@/components/NotificationBanner/NotificationBanner";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import StopList from "@/components/StopList/StopList";
import dynamic from "next/dynamic";
import type { Notification } from "@/types";

const RouteMap = dynamic(() => import("@/components/RouteMap/RouteMap"), { ssr: false });

interface BusInfo {
  busNumber: string;
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE";
  currentLocation: { latitude: number; longitude: number };
  eta: number;
  nextStop: string;
  lastUpdate: number;
}

interface StudentDashboardProps {
  bus?: BusInfo;
  studentStop?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

function getDefaultBus(): BusInfo {
  const demoBus = DEMO_BUSES[0];
  const route = DEMO_ROUTES.find(r => r.routeId === demoBus.routeId);
  return {
    busNumber: demoBus.busNumber,
    status: demoBus.status as "ON_ROUTE" | "DELAYED" | "OFFLINE",
    currentLocation: demoBus.currentLocation,
    eta: 8,
    nextStop: route ? route.stops[Math.min(1, route.stops.length - 1)].name : "Civil Lines",
    lastUpdate: demoBus.lastUpdate,
  };
}

function getDefaultStop() {
  const demoBus = DEMO_BUSES[0];
  const route = DEMO_ROUTES.find(r => r.routeId === demoBus.routeId);
  const lastStop = route ? route.stops[route.stops.length - 1] : DEMO_STOPS[DEMO_STOPS.length - 1];
  return {
    name: lastStop.name,
    latitude: lastStop.latitude,
    longitude: lastStop.longitude,
  };
}

export default function StudentDashboard({ bus, studentStop }: StudentDashboardProps) {
  const [demoToggled, setDemoToggled] = useState(() => isDemoMode());
  const [selectedBus] = useState<BusInfo>(() => bus?.busNumber ? bus : getDefaultBus());
  const [selectedStop] = useState(() => studentStop?.name ? studentStop : getDefaultStop());
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user && !isDemoMode()) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const etaResult = useMemo(
    () => calculateETA(selectedBus.currentLocation, selectedStop, undefined, undefined),
    [selectedBus.currentLocation, selectedStop]
  );

  const eta = etaResult.minutes;

  const fallbackNotifications: Notification[] = useMemo(() => [
    { id: "n1", type: "info" as const, title: "Bus departed", message: `Bus #${selectedBus.busNumber} has departed from College Campus`, timestamp: 0, read: false },
    { id: "n2", type: "success" as const, title: "Civil Lines passed", message: `Bus #${selectedBus.busNumber} has passed Civil Lines`, timestamp: 0, read: false },
  ], [selectedBus.busNumber]);

  const notifications: Notification[] = useMemo(() => {
    const delay = selectedBus.status === "DELAYED" ? 8 : 0;
    const generated = generateNotifications(etaResult, selectedBus.busNumber, delay);
    return generated.length > 0 ? generated : fallbackNotifications;
  }, [etaResult, selectedBus.busNumber, selectedBus.status, fallbackNotifications]);

  const handleDemoToggle = useCallback(() => {
    setDemoToggled(prev => {
      const next = !prev;
      setDemoMode(next);
      return next;
    });
  }, []);

  const handleLogout = useCallback(() => {
    setDemoMode(false);
    localStorage.removeItem("busalert_user_role");
    getFirebaseAuth().signOut();
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">BUSALERT</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-800 font-medium">
              {demoToggled ? "DEMO MODE" : "Live"}
            </span>
            <button
              onClick={handleDemoToggle}
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              {demoToggled ? "Live" : "Demo"}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <NotificationBanner busEta={eta} studentWalkingTime={5} />

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Bus #{selectedBus.busNumber || "—"}</p>
              <div className="mt-1">
                <StatusBadge status={selectedBus.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-gray-900">{eta} min</p>
              <p className="text-sm text-gray-600 font-medium">ETA</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">Next stop: {selectedBus.nextStop || "—"}</p>
        </div>

        <ETACard
          busLocation={selectedBus.currentLocation}
          destinationStop={selectedStop}
          studentWalkingTime={5}
        />

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={handleDemoToggle}
            className={`flex-1 py-3 rounded-md font-bold transition-colors ${demoToggled ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
          >
            {demoToggled ? "Switch to Live" : "Start Demo Mode"}
          </button>
          <button
            onClick={() => router.push("/tracking/bus-01")}
            className="flex-1 py-3 rounded-md font-bold bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            View Live Tracking
          </button>
        </div>

        <div className="mt-8">
          <StopList
            stops={DEMO_STOPS}
            currentStopIndex={1}
            nextStopIndex={2}
          />
        </div>

        <div className="mt-8">
          <RouteMap
            route={getRouteForBus("bus-01")?.stops || DEMO_STOPS}
            currentPosition={selectedBus.currentLocation.latitude !== 0 ? selectedBus.currentLocation : null}
            currentStopIndex={1}
            nextStopIndex={2}
          />
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3">TODAY&apos;S SCHEDULE</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium text-gray-800">Morning Bus</p>
              <p className="text-primary font-bold">{DEMO_SCHEDULE.morning}</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Return Bus</p>
              <p className="text-primary font-bold">{DEMO_SCHEDULE.return}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">RECENT STATUS</h3>
          <div className="space-y-2 text-sm">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center gap-2">
                <span className={`font-bold ${n.type === "success" ? "text-green-600" : n.type === "warning" ? "text-yellow-600" : "text-blue-600"}`}>
                  {n.type === "success" ? "✓" : n.type === "warning" ? "!" : "→"}
                </span>
                <span className="text-gray-800">{n.title}</span>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-gray-500 text-center">No recent updates</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
