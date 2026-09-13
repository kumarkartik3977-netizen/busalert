"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import { getFirebaseAuth } from "@/lib/firebase";
import { DEMO_ANALYTICS, DEMO_ROUTES, DEMO_BUSES } from "@/lib/demoData";
import BusCard from "@/components/BusCard/BusCard";
import * as Recharts from "recharts";

interface BusAnalytics {
  busId: string;
  busNumber: string;
  onTime: number;
  delayed: number;
  offline: number;
  totalTrips: number;
  averageDelay: number;
  onTimePercentage: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [demoToggled, setDemoToggled] = useState(() => isDemoMode());

  useEffect(() => {
    if (isDemoMode()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const buses: BusAnalytics[] = DEMO_ANALYTICS.map((a) => ({
    ...a,
    offline: 0,
  }));

  const activeBuses = buses.length;
  const onTimeBuses = buses.filter(b => b.onTimePercentage > 80).length;
  const delayedBuses = buses.filter(b => b.onTimePercentage > 60 && b.onTimePercentage <= 80).length;
  const offlineBuses = buses.filter(b => b.onTimePercentage <= 60).length;

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
          <h1 className="text-2xl font-bold text-gray-900">ADMIN DASHBOARD</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-800 font-medium">Admin Panel</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Active Buses</p>
            <p className="text-3xl font-bold text-gray-900">{activeBuses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-600 font-medium">On Time</p>
            <p className="text-3xl font-bold text-green-700">{onTimeBuses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Delayed</p>
            <p className="text-3xl font-bold text-orange-700">{delayedBuses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Offline</p>
            <p className="text-3xl font-bold text-gray-700">{offlineBuses}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => router.push("/admin/stops")}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Manage Bus Stops
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {buses.map((bus) => {
            const demoBus = DEMO_BUSES.find(b => b.busNumber === bus.busNumber);
            const status = bus.onTimePercentage > 80 ? "ON_ROUTE" as const : bus.onTimePercentage > 60 ? "DELAYED" as const : "OFFLINE" as const;
            const route = DEMO_ROUTES.find(r => r.routeId === demoBus?.routeId);
            const nextStopName = route?.stops[1]?.name || "—";

            return (
              <BusCard
                key={bus.busId}
                busNumber={bus.busNumber}
                eta={bus.averageDelay}
                status={status}
                nextStop={nextStopName}
                onSelect={() => router.push(`/tracking/${bus.busId}`)}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">ON-TIME PERFORMANCE</h3>
            <div className="h-48">
              <Recharts.PieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Recharts.Pie
                  data={buses}
                  dataKey="onTimePercentage"
                  nameKey="busNumber"
                  name="Bus"
                >
                  {buses.map((bus, i) => (
                    <Recharts.Cell key={`cell-${i}`} fill={bus.onTimePercentage > 80 ? "#10b981" : bus.onTimePercentage > 60 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Recharts.Pie>
                <Recharts.Tooltip />
                <Recharts.Legend />
              </Recharts.PieChart>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">AVERAGE DELAY (min)</h3>
            <div className="h-48">
              <Recharts.BarChart data={buses} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Recharts.Bar dataKey="averageDelay" name="Delay" fill="#f97316" />
                <Recharts.XAxis dataKey="busNumber" tick={{ fill: "#374151" }} />
                <Recharts.YAxis tick={{ fill: "#374151" }} />
                <Recharts.Tooltip />
              </Recharts.BarChart>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">COMPLETED TRIPS</h3>
            <div className="h-48">
              <Recharts.LineChart data={buses} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Recharts.Line type="monotone" dataKey="totalTrips" stroke="#6366f1" activeDot={{ r: 8 }} />
                <Recharts.XAxis dataKey="busNumber" tick={{ fill: "#374151" }} />
                <Recharts.YAxis tick={{ fill: "#374151" }} />
                <Recharts.Tooltip />
              </Recharts.LineChart>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">BUS STATUS</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-300">
                  <th className="p-3 text-gray-900 font-bold">Bus</th>
                  <th className="p-3 text-gray-900 font-bold">Route</th>
                  <th className="p-3 text-gray-900 font-bold">Status</th>
                  <th className="p-3 text-gray-900 font-bold">Trips</th>
                  <th className="p-3 text-gray-900 font-bold">On Time %</th>
                  <th className="p-3 text-gray-900 font-bold">Avg Delay</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => {
                  const statusClass = bus.onTimePercentage > 80 ? "text-green-700 bg-green-50" : bus.onTimePercentage > 60 ? "text-orange-700 bg-orange-50" : "text-red-700 bg-red-50";
                  const route = DEMO_ROUTES.find(r => r.routeId === DEMO_BUSES.find(b => b.busNumber === bus.busNumber)?.routeId);

                  return (
                    <tr key={bus.busNumber} className="border-b border-gray-200">
                      <td className="p-3 font-bold text-gray-900">{bus.busNumber}</td>
                      <td className="p-3 text-gray-800">{route?.name || "—"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>
                          {bus.onTimePercentage > 80 ? "🟢 On Time" : bus.onTimePercentage > 60 ? "🟡 Delayed" : "🔴 Off Track"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-800">{bus.totalTrips}</td>
                      <td className="p-3 text-gray-800">{bus.onTimePercentage}%</td>
                      <td className="p-3 text-gray-800">{bus.averageDelay} min</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
