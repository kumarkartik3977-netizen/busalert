"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  isDemoMode,
  setDemoMode,
  simulateBusMovement,
  getCurrentLocation,
  startWatchingPosition,
  stopWatchingPosition,
} from "@/lib/geolocation";
import { getFirebaseAuth } from "@/lib/firebase";
import { haversineDistance } from "@/lib/eta";
import { DEMO_ROUTES } from "@/lib/demoData";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import StopList from "@/components/StopList/StopList";
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

export default function DriverDashboard({ busNumber = "", route = [], onTripStart, onTripEnd }: DriverDashboardProps) {
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
  const router = useRouter();
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDemoMode()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

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
    },
    [activeRoute]
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
  }, [activeRoute]);

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

  const handleLogout = () => {
    stopWatchingPosition();
    stopDemoSimulation();
    setDemoMode(false);
    localStorage.removeItem("busalert_user_role");
    getFirebaseAuth().signOut();
    router.push("/login");
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
      </main>
    </div>
  );
}
