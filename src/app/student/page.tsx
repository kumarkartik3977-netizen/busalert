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
import StudentRouteForm from "@/components/StudentRouteForm/StudentRouteForm";
import dynamic from "next/dynamic";
import type { Notification, StudentRoute, RouteStop } from "@/types";

const RouteMap = dynamic(() => import("@/components/RouteMap/RouteMap"), { ssr: false });

const STORAGE_KEY = "busalert_student_route";

function loadSavedRoute(): StudentRoute | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoute(route: StudentRoute | null) {
  if (typeof window === "undefined") return;
  if (route) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(route));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface BusInfo {
  busNumber: string;
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE";
  currentLocation: { latitude: number; longitude: number };
  eta: number;
  nextStop: string;
  lastUpdate: number;
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

function getFilteredRouteStops(fullRoute: RouteStop[], originId: string, destId: string): RouteStop[] {
  const originIdx = fullRoute.findIndex((s) => s.stopId === originId);
  const destIdx = fullRoute.findIndex((s) => s.stopId === destId);
  if (originIdx === -1 || destIdx === -1) return fullRoute;
  const start = Math.min(originIdx, destIdx);
  const end = Math.max(originIdx, destIdx);
  return fullRoute.slice(start, end + 1);
}

export default function StudentDashboard() {
  const [demoToggled, setDemoToggled] = useState(() => isDemoMode());
  const [selectedBus] = useState<BusInfo>(() => getDefaultBus());
  const [savedRoute, setSavedRoute] = useState<StudentRoute | null>(null);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSavedRoute(loadSavedRoute());
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user && !isDemoMode()) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const allRouteStops: RouteStop[] = useMemo(() => {
    return getRouteForBus("bus-01")?.stops || DEMO_STOPS;
  }, []);

  const mapRouteStops: RouteStop[] = useMemo(() => {
    if (!savedRoute) return allRouteStops;
    return getFilteredRouteStops(allRouteStops, savedRoute.originStopId, savedRoute.destinationStopId);
  }, [allRouteStops, savedRoute]);

  const originStop = useMemo(() => {
    if (!savedRoute) return undefined;
    return allRouteStops.find((s) => s.stopId === savedRoute.originStopId);
  }, [allRouteStops, savedRoute]);

  const destStop = useMemo(() => {
    if (!savedRoute) return undefined;
    return allRouteStops.find((s) => s.stopId === savedRoute.destinationStopId);
  }, [allRouteStops, savedRoute]);

  const selectedStop = useMemo(() => {
    if (destStop) return { name: destStop.name, latitude: destStop.latitude, longitude: destStop.longitude };
    return { name: allRouteStops[allRouteStops.length - 1]?.name || "", latitude: allRouteStops[allRouteStops.length - 1]?.latitude || 0, longitude: allRouteStops[allRouteStops.length - 1]?.longitude || 0 };
  }, [destStop, allRouteStops]);

  const etaResult = useMemo(
    () => calculateETA(selectedBus.currentLocation, selectedStop, undefined, undefined),
    [selectedBus.currentLocation, selectedStop]
  );

  const eta = etaResult.minutes;

  const originIdx = originStop ? mapRouteStops.findIndex((s) => s.stopId === originStop.stopId) : -1;
  const destIdx = destStop ? mapRouteStops.findIndex((s) => s.stopId === destStop.stopId) : -1;

  const currentStopIdx = useMemo(() => {
    if (originIdx === -1) return 0;
    let minDist = Infinity;
    let idx = originIdx;
    for (let i = 0; i < mapRouteStops.length; i++) {
      const d = Math.abs(selectedBus.currentLocation.latitude - mapRouteStops[i].latitude) +
                Math.abs(selectedBus.currentLocation.longitude - mapRouteStops[i].longitude);
      if (d < minDist) { minDist = d; idx = i; }
    }
    return idx;
  }, [mapRouteStops, selectedBus.currentLocation, originIdx]);

  const nextStopIdx = Math.min(currentStopIdx + 1, mapRouteStops.length - 1);

  const fallbackNotifications: Notification[] = useMemo(() => [
    { id: "n1", type: "info" as const, title: "Bus departed", message: `Bus #${selectedBus.busNumber} has departed`, timestamp: 0, read: false },
    { id: "n2", type: "success" as const, title: "Stop passed", message: `Bus #${selectedBus.busNumber} has passed a stop`, timestamp: 0, read: false },
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

  const handleSaveRoute = useCallback((route: StudentRoute) => {
    setSavedRoute(route);
    saveRoute(route);
    setShowRouteForm(false);
  }, []);

  const handleClearRoute = useCallback(() => {
    setSavedRoute(null);
    saveRoute(null);
  }, []);

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

        {!savedRoute && !showRouteForm && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚌</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Set Your Route</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select your pickup and drop-off stops to see your personalized route and fares.
                </p>
                <button
                  onClick={() => setShowRouteForm(true)}
                  className="mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Choose Stops
                </button>
              </div>
            </div>
          </div>
        )}

        {showRouteForm && (
          <div className="mb-6">
            <StudentRouteForm
              stops={allRouteStops}
              savedRoute={savedRoute}
              onSave={handleSaveRoute}
              onCancel={() => setShowRouteForm(false)}
            />
          </div>
        )}

        {savedRoute && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="w-0.5 h-4 bg-gray-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">{savedRoute.originName}</p>
                  <p className="text-xs text-gray-400">to</p>
                  <p className="text-sm font-medium text-red-700">{savedRoute.destinationName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRouteForm(true)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change
                </button>
                <button
                  onClick={handleClearRoute}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

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
            stops={mapRouteStops}
            currentStopIndex={currentStopIdx}
            nextStopIndex={nextStopIdx}
          />
        </div>

        <div className="mt-8">
          <RouteMap
            route={mapRouteStops}
            currentPosition={selectedBus.currentLocation.latitude !== 0 ? selectedBus.currentLocation : null}
            currentStopIndex={currentStopIdx}
            nextStopIndex={nextStopIdx}
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
