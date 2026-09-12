"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { isDemoMode, setDemoMode, simulateBusMovement, getCurrentLocation } from "../../lib/geolocation";
import { calculateETA } from "../../lib/eta";
import { auth } from "../../lib/firebase";

export interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface DriverDashboardProps {
  busNumber: string;
  route: RouteStop[];
  onTripStart: () => void;
  onTripEnd: () => void;
}

export default function DriverDashboard({ busNumber, route, onTripStart, onTripEnd }: DriverDashboardProps) {
  const [state, setState] = useState({
    isOnTrip: false,
    currentPosition: null,
    currentStopIndex: 0,
    nextStopIndex: 1,
    tripStartTime: null,
    demoProgress: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!state.isOnTrip) return;
    
    const demoInterval = setInterval(() => {
      setState(prev => {
        const newProgress = prev.demoProgress + 0.05;
        const result = simulateBusMovement(route, newProgress);
        
        const nextStop = route[result.nextStopIndex];
        let eta = 5;
        if (result.currentStopIndex >= 0 && result.nextStopIndex >= 0) {
          const currentPos = route[result.currentStopIndex];
          const distanceKm = Math.sqrt(
            (nextStop.latitude - currentPos.latitude) ** 2 + 
            (nextStop.longitude - currentPos.longitude) ** 2
          ) * 111;
          eta = Math.round((distanceKm / 30) * 60);
        }
        
        return {
          ...prev,
          currentPosition: result.latitude !== undefined ? { latitude: result.latitude, longitude: result.longitude } : prev.currentPosition,
          currentStopIndex: result.currentStopIndex,
          nextStopIndex: result.nextStopIndex,
          tripStartTime: prev.tripStartTime,
          demoProgress: newProgress,
        };
      });
    }, 3000);
    
    return () => clearInterval(demoInterval);
  }, [state.isOnTrip, route]);

  const handleStartTrip = async () => {
    const location = await getCurrentLocation();
    setState({
      ...state,
      isOnTrip: true,
      currentPosition: location,
      tripStartTime: Date.now(),
    });
  };

  const handleEndTrip = () => {
    setState({
      isOnTrip: false,
      currentPosition: null,
      currentStopIndex: 0,
      nextStopIndex: 1,
      tripStartTime: null,
      demoProgress: 0,
    });
    setDemoMode(false);
  };

  const handleDemoToggle = () => {
    setDemoMode(!isDemoMode());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">DRIVER DASHBOARD</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Bus #{busNumber}</span>
            <button
              onClick={handleDemoToggle}
              className="px-3 py-1 text-xs rounded-md hover:bg-gray-100 transition-colors"
              title="Toggle Demo Mode"
            >
              {isDemoMode() ? "Live" : "Demo"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className={`bg-white rounded-2xl shadow-lg p-6 mb-6 ${state.isOnTrip ? "border-green-500" : "border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trip Status</p>
              <p className="text-xl font-bold {state.isOnTrip ? "text-green-600" : "text-gray-500"}">
                {state.isOnTrip ? "🟢 ON ROUTE" : "OFFLINE"}
              </p>
            </div>
            <button
              onClick={state.isOnTrip ? handleEndTrip : handleStartTrip}
              className="px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors {state.isOnTrip ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}"
            >
              {state.isOnTrip ? "END TRIP" : "START TRIP"}
            </button>
          </div>
          
          {state.isOnTrip && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Current Location</p>
              {state.currentPosition ? (
                <p className="font-medium">{state.currentPosition.latitude.toFixed(4)}, {state.currentPosition.longitude.toFixed(4)}</p>
              ) : (
                <p className="text-gray-400">GPS unavailable — Demo Mode available</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Speed: {state.isOnTrip ? "32 km/h" : "—"} km/h</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-medium mb-4">Route: {route.map(r => r.name).join(" → ")}</h3>
          
          <div className="space-y-2 text-sm">
            {route.map((stop, index) => (
              <div key={stop.stopId} className={`flex items-center gap-3 ${index >= state.currentStopIndex && index <= state.nextStopIndex ? "text-primary" : "text-gray-500"}`}>
                <span className="w-2 h-2 rounded-full {index === state.currentStopIndex ? "bg-green-500" : index === state.nextStopIndex ? "bg-yellow-500" : "bg-gray-300"}"></span>
                <span>{stop.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">Speed</p>
            <p className="text-2xl font-bold">{state.isOnTrip ? "32" : "—"} km/h</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ETA to Next</p>
            <p className="text-2xl font-bold">5 min</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Stop</p>
            <p className="text-2xl font-bold">{route[state.nextStopIndex]?.name || "—"}</p>
          </div>
        </div>

      </main>
    </div>
  );
}