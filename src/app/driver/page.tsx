"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  isDemoMode,
  setDemoMode,
  simulateBusMovement,
  getCurrentLocation,
  startWatchingPosition,
  stopWatchingPosition,
} from "@/lib/geolocation";
import { haversineDistance } from "@/lib/eta";
import { DEMO_ROUTES } from "@/lib/demoData";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard/AuthGuard";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import StopList from "@/components/StopList/StopList";
import RouteProgressTimeline from "@/components/RouteProgressTimeline/RouteProgressTimeline";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/RouteMap/RouteMap"), { ssr: false });

export interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface DriverDashboardProps {
  busNumber?: string;
  route?: RouteStop[];
  onTripStart?: () => void;
  onTripEnd?: () => void;
}

function findNearestStopIndex(
  position: { latitude: number; longitude: number },
  route: RouteStop[]
): { currentStopIndex: number; nextStopIndex: number } {
  let minDist = Infinity;
  let nearestIdx = 0;
  for (let i = 0; i < route.length; i++) {
    const d = haversineDistance(position, route[i]);
    if (d < minDist) {
      minDist = d;
      nearestIdx = i;
    }
  }
  return {
    currentStopIndex: nearestIdx,
    nextStopIndex: Math.min(nearestIdx + 1, route.length - 1),
  };
}

function DriverDashboardContent({ busNumber = "", route = [], onTripStart, onTripEnd }: DriverDashboardProps) {
  const [state, setState] = useState({
    isOnTrip: false,
    currentPosition: null as { latitude: number; longitude: number } | null,
    currentStopIndex: 0,
    nextStopIndex: 1,
    tripStartTime: null as number | null,
    demoProgress: 0,
    speed: 0,
    etaMinutes: 0,
  });
  const [gpsStatus, setGpsStatus] = useState<"idle" | "active" | "error">("idle");
  const [gpsError, setGpsError] = useState<string>("");
  const [demoToggled, setDemoToggled] = useState(() => isDemoMode());
  const [isGrabMode, setIsGrabMode] = useState(false);
  const [grabbedLocations, setGrabbedLocations] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [grabStatus, setGrabStatus] = useState<string>("");
  const [expandedGrabStop, setExpandedGrabStop] = useState<string | null>(null);
  const [activeRoute] = useState<RouteStop[]>(() => {
    if (isDemoMode() && route.length === 0) {
      return DEMO_ROUTES[0].stops;
    }
    return route;
  });
  const [activeBusNumber] = useState(() => {
    if (isDemoMode() && route.length === 0) {
      return "01";
    }
    return busNumber;
  });
  const { logout } = useAuth();
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleGpsPosition = useCallback(
    (pos: { latitude: number; longitude: number; speed: number; timestamp: number }) => {
      const speedKmph = pos.speed > 0 ? Math.round(pos.speed * 3.6) : 0;
      const { currentStopIndex, nextStopIndex } = findNearestStopIndex(pos, activeRoute);

      const nextStop = activeRoute[nextStopIndex];
      const distToNext = haversineDistance(pos, nextStop);
      const etaMinutes = speedKmph > 0 ? Math.round((distToNext / speedKmph) * 60) : 0;

      setState((prev) => ({
        ...prev,
        currentPosition: { latitude: pos.latitude, longitude: pos.longitude },
        currentStopIndex,
        nextStopIndex,
        speed: speedKmph || prev.speed || 0,
        etaMinutes,
      }));

      fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: `bus-${activeBusNumber || "01"}`,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: speedKmph,
          currentStopIndex,
          nextStopIndex,
        }),
      }).catch(() => {});
    },
    [activeRoute, activeBusNumber]
  );

  const startDemoSimulation = useCallback(() => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

    demoIntervalRef.current = setInterval(() => {
      setState((prev) => {
        const newProgress = prev.demoProgress + 0.05;
        const result = simulateBusMovement(activeRoute, newProgress);

        const nextStop = activeRoute[result.nextStopIndex];
        let speed = 30;
        let etaMinutes = 5;

        if (result.currentStopIndex >= 0 && result.nextStopIndex >= 0) {
          const currentPos = activeRoute[result.currentStopIndex];
          const distanceKm = haversineDistance(currentPos, nextStop);
          speed = Math.round((distanceKm / 0.05) * 60);
          if (speed < 5) speed = 5;
          if (speed > 60) speed = 60;
          etaMinutes = Math.round((distanceKm / speed) * 60);
          if (etaMinutes < 1) etaMinutes = 1;
        }

        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busId: `bus-${activeBusNumber || "01"}`,
            latitude: result.latitude,
            longitude: result.longitude,
            speed,
            currentStopIndex: result.currentStopIndex,
            nextStopIndex: result.nextStopIndex,
          }),
        }).catch(() => {});

        return {
          ...prev,
          currentPosition: { latitude: result.latitude, longitude: result.longitude },
          currentStopIndex: result.currentStopIndex,
          nextStopIndex: result.nextStopIndex,
          demoProgress: newProgress,
          speed,
          etaMinutes,
        };
      });
    }, 3000);
  }, [activeRoute, activeBusNumber]);

  const stopDemoSimulation = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, []);

  const handleStartTrip = async () => {
    const demo = isDemoMode();

    if (demo) {
      const location = await getCurrentLocation();
      setState((prev) => ({
        ...prev,
        isOnTrip: true,
        currentPosition: { latitude: location.latitude, longitude: location.longitude },
        tripStartTime: Date.now(),
      }));
      startDemoSimulation();
    } else {
      setState((prev) => ({
        ...prev,
        isOnTrip: true,
        tripStartTime: Date.now(),
      }));

      startWatchingPosition(
        (pos) => {
          setGpsStatus("active");
          setGpsError("");
          handleGpsPosition(pos);
        },
        (err) => {
          setGpsStatus("error");
          setGpsError(err);
        }
      );
    }
    onTripStart?.();
  };

  const handleEndTrip = () => {
    stopWatchingPosition();
    stopDemoSimulation();
    setState({
      isOnTrip: false,
      currentPosition: null,
      currentStopIndex: 0,
      nextStopIndex: 1,
      tripStartTime: null,
      demoProgress: 0,
      speed: 0,
      etaMinutes: 0,
    });
    setGpsStatus("idle");
    setGpsError("");
    onTripEnd?.();
  };

  const handleDemoToggle = () => {
    const newDemo = !demoToggled;
    setDemoToggled(newDemo);
    setDemoMode(newDemo);
  };

  const handleGrabLocation = async (stopId: string, stopName: string) => {
    setGrabStatus(`Capturing location for ${stopName}...`);
    try {
      const pos = await getCurrentLocation();
      if (pos.error && !isDemoMode()) {
        setGrabStatus(`Error: ${pos.error}`);
        return;
      }
      setGrabbedLocations((prev) => ({
        ...prev,
        [stopId]: { latitude: pos.latitude, longitude: pos.longitude },
      }));
      setGrabStatus(`Captured ${stopName} successfully!`);
    } catch {
      setGrabStatus("Failed to get location. Please try again.");
    }
  };

  const handleGrabAllStops = async () => {
    setGrabStatus("Grabbing all stops sequentially...");
    for (let i = 0; i < activeRoute.length; i++) {
      const stop = activeRoute[i];
      setGrabStatus(`Capturing stop ${i + 1}/${activeRoute.length}: ${stop.name}...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const pos = await getCurrentLocation();
      if (pos.error && !isDemoMode()) {
        setGrabStatus(`Error at ${stop.name}: ${pos.error}. Stopping.`);
        return;
      }
      setGrabbedLocations((prev) => ({
        ...prev,
        [stop.stopId]: { latitude: pos.latitude, longitude: pos.longitude },
      }));
    }
    setGrabStatus(`All ${activeRoute.length} stops captured!`);
  };

  const handleExportGrabbedLocations = () => {
    const exportData = activeRoute.map((stop) => {
      const grabbed = grabbedLocations[stop.stopId];
      return {
        stopId: stop.stopId,
        originalName: stop.name,
        originalLatitude: stop.latitude,
        originalLongitude: stop.longitude,
        grabbedLatitude: grabbed?.latitude ?? null,
        grabbedLongitude: grabbed?.longitude ?? null,
        grabbed: !!grabbed,
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bus-stop-locations-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setGrabStatus("Locations exported to JSON file!");
  };

  const handleLogout = () => {
    stopWatchingPosition();
    stopDemoSimulation();
    setDemoMode(false);
    logout();
  };

  useEffect(() => {
    return () => {
      stopWatchingPosition();
      stopDemoSimulation();
    };
  }, [stopDemoSimulation]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">DRIVER DASHBOARD</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-800 font-medium">Bus #{activeBusNumber || "—"}</span>
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
        <div className={`bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 ${state.isOnTrip ? "border-green-500" : "border-gray-300"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Trip Status</p>
              <StatusBadge status={state.isOnTrip ? "ON_ROUTE" : "OFFLINE"} />
            </div>
            <button
              onClick={state.isOnTrip ? handleEndTrip : handleStartTrip}
              className={`px-4 py-2 rounded-md font-bold transition-colors ${state.isOnTrip ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
            >
              {state.isOnTrip ? "END TRIP" : "START TRIP"}
            </button>
          </div>

          {state.isOnTrip && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Current Location</p>
              {state.currentPosition ? (
                <p className="font-bold text-gray-900">{state.currentPosition.latitude.toFixed(6)}, {state.currentPosition.longitude.toFixed(6)}</p>
              ) : (
                <p className="text-gray-600">Acquiring GPS signal...</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-gray-600">Speed: {state.isOnTrip ? state.speed : "—"} km/h</p>
                {!demoToggled && (
                  <span className={`inline-flex items-center gap-1 text-xs ${gpsStatus === "active" ? "text-green-600" : gpsStatus === "error" ? "text-red-600" : "text-gray-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${gpsStatus === "active" ? "bg-green-500" : gpsStatus === "error" ? "bg-red-500" : "bg-gray-300"}`} />
                    {gpsStatus === "active" ? "GPS Live" : gpsStatus === "error" ? gpsError : "GPS Off"}
                  </span>
                )}
                {demoToggled && (
                  <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">Speed</p>
            <p className="text-2xl font-bold text-gray-900">{state.isOnTrip ? state.speed : "—"} km/h</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">ETA to Next</p>
            <p className="text-2xl font-bold text-gray-900">{state.isOnTrip ? state.etaMinutes : "—"} min</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">Next Stop</p>
            <p className="text-2xl font-bold text-gray-900">{activeRoute[state.nextStopIndex]?.name || "—"}</p>
          </div>
        </div>

        {state.isOnTrip && (
          <div className="mb-6">
            <RouteProgressTimeline
              route={activeRoute}
              currentStopIndex={state.currentStopIndex}
              nextStopIndex={state.nextStopIndex}
              speed={state.speed}
              etaMinutes={state.etaMinutes}
            />
          </div>
        )}

        <div className="mb-6">
          <RouteMap
            route={activeRoute}
            currentPosition={state.currentPosition}
            currentStopIndex={state.currentStopIndex}
            nextStopIndex={state.nextStopIndex}
          />
        </div>

        <StopList
          stops={activeRoute}
          currentStopIndex={state.currentStopIndex}
          nextStopIndex={state.nextStopIndex}
        />

        <div className="mt-6 bg-white rounded-2xl shadow-lg border-l-4 border-blue-500">
          <button
            onClick={() => setIsGrabMode(!isGrabMode)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-900">Grab Bus Stop Locations</h2>
              <p className="text-sm text-gray-600">
                {Object.keys(grabbedLocations).length}/{activeRoute.length} stops captured
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isGrabMode ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isGrabMode && (
            <div className="px-6 pb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={handleGrabAllStops}
                  className="px-4 py-2 rounded-md font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm"
                >
                  Grab All Stops
                </button>
                <button
                  onClick={handleExportGrabbedLocations}
                  disabled={Object.keys(grabbedLocations).length === 0}
                  className="px-4 py-2 rounded-md font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Locations (JSON)
                </button>
                <button
                  onClick={() => setGrabbedLocations({})}
                  className="px-4 py-2 rounded-md font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>

              {grabStatus && (
                <p className="text-sm text-blue-700 bg-blue-50 rounded-md px-3 py-2 mb-4">{grabStatus}</p>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeRoute.map((stop) => {
                  const grabbed = grabbedLocations[stop.stopId];
                  const isExpanded = expandedGrabStop === stop.stopId;
                  const isCaptured = !!grabbed;

                  return (
                    <div
                      key={stop.stopId}
                      className={`border rounded-lg p-3 transition-colors ${isCaptured ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${isCaptured ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          <span className="font-medium text-gray-900 text-sm">{stop.name}</span>
                          <span className="text-xs text-gray-500">#{stop.order + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setExpandedGrabStop(isExpanded ? null : stop.stopId)
                            }
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? "Hide" : "Details"}
                          </button>
                          <button
                            onClick={() => handleGrabLocation(stop.stopId, stop.name)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                              isCaptured
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {isCaptured ? "Recapture" : "Capture"}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                          <p>Original: {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}</p>
                          {grabbed ? (
                            <p className="text-green-700 font-medium">
                              Grabbed: {grabbed.latitude.toFixed(6)}, {grabbed.longitude.toFixed(6)}
                            </p>
                          ) : (
                            <p className="text-gray-400">Not yet captured</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DriverDashboardPage() {
  return (
    <AuthGuard role="driver">
      <DriverDashboardContent />
    </AuthGuard>
  );
}
