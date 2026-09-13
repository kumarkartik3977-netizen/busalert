"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { isDemoMode } from "@/lib/geolocation";
import { getFirebaseAuth } from "@/lib/firebase";
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

  useEffect(() => {
    if (isDemoMode()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const buses: BusAnalytics[] = [
    { busId: "01", busNumber: "01", onTime: 13, delayed: 2, offline: 0, totalTrips: 15, averageDelay: 3, onTimePercentage: 87 },
    { busId: "05", busNumber: "05", onTime: 11, delayed: 3, offline: 0, totalTrips: 12, averageDelay: 5, onTimePercentage: 92 },
    { busId: "07", busNumber: "07", onTime: 8, delayed: 4, offline: 0, totalTrips: 10, averageDelay: 8, onTimePercentage: 80 },
    { busId: "12", busNumber: "12", onTime: 9, delayed: 5, offline: 0, totalTrips: 14, averageDelay: 6, onTimePercentage: 64 },
  ];

  const totalTrips = buses.reduce((sum, b) => sum + b.totalTrips, 0);
  const totalOnTime = buses.reduce((sum, b) => sum + b.onTime, 0);
  const overallOnTimePercentage = Math.round((totalOnTime / totalTrips) * 100);
  const activeBuses = buses.length;
  const onTimeBuses = buses.filter(b => b.onTimePercentage > 80).length;
  const delayedBuses = buses.filter(b => b.onTimePercentage > 60 && b.onTimePercentage <= 80).length;
  const offlineBuses = buses.filter(b => b.onTimePercentage <= 60).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ADMIN DASHBOARD</h1>
          <span className="text-sm text-gray-800 font-medium">Admin Panel</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">ON-TIME PERFORMANCE</h3>
            <div className="h-48">
              <Recharts.PieChart data={buses} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Recharts.Pie
                  dataKey="onTimePercentage"
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
                  <th className="p-3 text-gray-900 font-bold">Driver</th>
                  <th className="p-3 text-gray-900 font-bold">Status</th>
                  <th className="p-3 text-gray-900 font-bold">Location</th>
                  <th className="p-3 text-gray-900 font-bold">ETA</th>
                  <th className="p-3 text-gray-900 font-bold">Delay</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => {
                  const statusClass = bus.onTimePercentage > 80 ? "text-green-700 bg-green-50" : bus.onTimePercentage > 60 ? "text-orange-700 bg-orange-50" : "text-red-700 bg-red-50";
                  const delayMinutes = bus.delayed;
                  const delayText = delayMinutes > 0 ? `${delayMinutes} min` : "0 min";
                  
                  return (
                    <tr key={bus.busNumber} className="border-b border-gray-200">
                      <td className="p-3 font-bold text-gray-900">{bus.busNumber}</td>
                      <td className="p-3 text-gray-800">Rahul</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>
                          {bus.onTimePercentage > 80 ? "🟢 On Time" : bus.onTimePercentage > 60 ? "🟡 Delayed" : "🔴 Off Track"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-800">Civil Lines</td>
                      <td className="p-3 text-gray-800">5 min</td>
                      <td className="p-3 text-gray-800">{delayText}</td>
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
