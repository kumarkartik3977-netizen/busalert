"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { isDemoMode, setDemoMode, simulateBusMovement, getCurrentLocation } from "@/lib/geolocation";
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

  useEffect(() => {
    if (isDemoMode()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!state.isOnTrip) return;

    const demoInterval = setInterval(() => {
      setState(prev => {
        const newProgress = prev.demoProgress + 0.05;
        const result = simulateBusMovement(activeRoute, newProgress);

        const nextStop = activeRoute[result.nextStopIndex];
        let speed = 30;
        let etaMinutes = 5;

        if (result.currentStopIndex >= 0 && result.nextStopIndex >= 0) {
          const currentPos = activeRoute[result.currentStopIndex];
          const distanceKm = haversineDistance(currentPos, nextStop);
          speed = Math.round(distanceKm / 0.05 * 60);
          if (speed < 5) speed = 5;
          if (speed > 60) speed = 60;
          etaMinutes = Math.round((distanceKm / speed) * 60);
          if (etaMinutes < 1) etaMinutes = 1;
        }

        return {
          ...prev,
          currentPosition: result.latitude !== undefined ? { latitude: result.latitude, longitude: result.longitude } : prev.currentPosition,
          currentStopIndex: result.currentStopIndex,
          nextStopIndex: result.nextStopIndex,
          tripStartTime: prev.tripStartTime,
          demoProgress: newProgress,
          speed,
          etaMinutes,
        };
      });
    }, 3000);

    return () => clearInterval(demoInterval);
  }, [state.isOnTrip, activeRoute]);

  const handleStartTrip = async () => {
    const location = await getCurrentLocation();
    setState({
      ...state,
      isOnTrip: true,
      currentPosition: { latitude: location.latitude, longitude: location.longitude },
      tripStartTime: Date.now(),
    });
    onTripStart?.();
  };

  const handleEndTrip = () => {
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
    onTripEnd?.();
  };

  const handleDemoToggle = () => {
    const newDemo = !demoToggled;
    setDemoToggled(newDemo);
    setDemoMode(newDemo);
  };

  const handleLogout = () => {
    setDemoMode(false);
    localStorage.removeItem("busalert_user_role");
    getFirebaseAuth().signOut();
    router.push("/login");
  };

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
                <p className="font-bold text-gray-900">{state.currentPosition.latitude.toFixed(4)}, {state.currentPosition.longitude.toFixed(4)}</p>
              ) : (
                <p className="text-gray-600">GPS unavailable — Demo Mode available</p>
              )}
              <p className="text-xs text-gray-600 mt-1">Speed: {state.isOnTrip ? state.speed : "—"} km/h</p>
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
