"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const result = calculateETA(
      bus.currentLocation,
      studentStop,
      undefined,
      undefined
    );
    setETA(result.minutes);
  }, [bus.currentLocation, studentStop]);

  useEffect(() => {
    if (demoToggled !== isDemoMode()) {
      setDemoMode(demoToggled);
    }
  }, [demoToggled]);

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
              onClick={() => setDemoToggled(!demoToggled)}
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              {demoToggled ? "Live" : "Demo"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Bus #{bus.busNumber || "—"}</p>
              <p className="text-xl font-bold text-gray-900">{bus.status === "ON_ROUTE" ? "🟢 ON ROUTE" : bus.status === "DELAYED" ? "🟡 DELAYED" : "⚫ OFFLINE"}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-gray-900">{eta} min</p>
              <p className="text-sm text-gray-600 font-medium">ETA</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">Next stop: {bus.nextStop || "—"}</p>
        </div>

        {eta <= 10 && (
          <div className={`mt-6 p-4 rounded-xl ${showLeaveNow ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} border-l-4 ${showLeaveNow ? "border-red-400" : "border-yellow-400"}`}>
            <div className="flex items-start">
              <span className="text-2xl mr-3 flex-shrink-0">{showLeaveNow ? "🚨" : "🚌"}</span>
              <div className="flex-1">
                <p className="font-bold">{showLeaveNow ? "LEAVE NOW" : `Bus arriving in approximately ${eta} minutes`}</p>
                {showLeaveNow && (
                  <p className="text-xs mt-1">Walk to stop + buffer: ~3 min</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => setDemoMode(!demoToggled)}
            className={`flex-1 py-3 rounded-md font-bold transition-colors ${demoToggled ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
          >
            {demoToggled ? "Switch to Live" : "Start Demo Mode"}
          </button>
          <button className="flex-1 py-3 rounded-md font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
            View Live Route
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3">TODAY'S SCHEDULE</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium text-gray-800">Morning Bus</p>
              <p className="text-primary font-bold">7:40 AM</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Return Bus</p>
              <p className="text-primary font-bold">4:30 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">RECENT STATUS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-800">Bus departed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-800">Civil Lines passed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-gray-800">Model Town next</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
