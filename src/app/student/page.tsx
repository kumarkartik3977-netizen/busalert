"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { calculateETA } from "@/lib/eta";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import { useRouter } from "next/navigation";

interface BusInfo {
  busNumber: string;
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE";
  currentLocation: { latitude: number; longitude: number };
  eta: number;
  nextStop: string;
  lastUpdate: number;
}

interface StudentDashboardProps {
  bus: BusInfo;
  studentStop: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

const defaultBus: BusInfo = {
  busNumber: "",
  status: "OFFLINE",
  currentLocation: { latitude: 0, longitude: 0 },
  eta: 0,
  nextStop: "",
  lastUpdate: 0,
};

const defaultStop = {
  name: "",
  latitude: 0,
  longitude: 0,
};

export default function StudentDashboard({ bus = defaultBus, studentStop = defaultStop }: StudentDashboardProps) {
  const [eta, setETA] = useState(bus.eta);
  const [showLeaveNow, setShowLeaveNow] = useState(false);
  const [demoToggled, setDemoToggled] = useState(false);
  const router = useRouter();

  // Calculate ETA and leave-now logic
  useEffect(() => {
    const result = calculateETA(
      bus.currentLocation,
      studentStop,
      undefined,
      undefined // could pass historical data
    );
    setETA(result.minutes);
    // In a real app, we'd show/hide the leave-now banner based on result.shouldLeaveNow
  }, [bus.currentLocation, studentStop]);

  // Demo mode toggle
  useEffect(() => {
    if (demoToggled !== isDemoMode()) {
      setDemoMode(demoToggled);
    }
  }, [demoToggled]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">BUSALERT</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {demoToggled ? "DEMO MODE" : "Live"}
              <button
                onClick={() => setDemoToggled(!demoToggled)}
                className="px-3 py-1 text-xs rounded-md hover:bg-gray-100 transition-colors"
              >
                {demoToggled ? "Live" : "Demo"}
              </button>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        
        {/* Bus Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bus #{bus.busNumber}</p>
              <p className="text-xl font-bold">{bus.status === "ON_ROUTE" ? "🟢 ON ROUTE" : bus.status === "DELAYED" ? "🟡 DELAYED" : "⚫ OFFLINE"}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold">{eta} min</p>
              <p className="text-sm text-gray-500">ETA</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">Next stop: {bus.nextStop}</p>
        </div>

        {/* Leave Now Banner */}
        {eta <= 10 && (
          <div className={`mt-6 p-4 rounded-xl ${showLeaveNow ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} border-l-4 ${showLeaveNow ? "border-red-400" : "border-yellow-400"}`}>
            <div className="flex items-start">
              <span className="text-2xl mr-3 flex-shrink-0">{showLeaveNow ? "🚨" : "🚌"}</span>
              <div className="flex-1">
                <p className="font-medium">{showLeaveNow ? "LEAVE NOW" : `Bus arriving in approximately ${eta} minutes`}</p>
                {showLeaveNow && (
                  <p className="text-xs mt-1">Walk to stop + buffer: ~${3} min</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => setDemoMode(!demoToggled)}
            className={`flex-1 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors ${demoToggled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {demoToggled ? "Switch to Live" : "Start Demo Mode"}
          </button>
          <button className="flex-1 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            View Live Route
          </button>
        </div>

        {/* Today's Schedule */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-medium mb-3">TODAY'S SCHEDULE</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Morning Bus</p>
              <p className="text-primary">7:40 AM</p>
            </div>
            <div>
              <p className="font-medium">Return Bus</p>
              <p className="text-primary">4:30 PM</p>
            </div>
          </div>
        </div>

        {/* Recent Status */}
        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-medium mb-3">RECENT STATUS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Bus departed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Civil Lines passed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              <span>Model Town next</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}