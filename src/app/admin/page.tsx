"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { calculateETA } from "@/lib/eta";
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

export default function AdminDashboard({ 
  activeBuses = 0, 
  onTimeBuses = 0, 
  delayedBuses = 0, 
  offlineBuses = 0 
}: {
  activeBuses: number;
  onTimeBuses: number;
  delayedBuses: number;
  offlineBuses: number;
}) {
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
  const overallAverageDelay = Math.round(
    buses.reduce((sum, b) => sum + b.averageDelay * (b.totalTrips || 1), 0) / totalTrips
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ADMIN DASHBOARD</h1>
          <span className="text-sm text-gray-500">Admin Panel</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Active Buses</p>
            <p className="text-3xl font-bold">{activeBuses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-500">On Time</p>
            <p className="text-3xl font-bold text-green-600">{onTimeBuses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Delayed</p>
            <p className="text-3xl font-bold text-orange-600">{delayedBuses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Offline</p>
            <p className="text-3xl font-bold text-gray-500">{offlineBuses}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-medium mb-4">ON-TIME PERFORMANCE</h3>
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
            <h3 className="font-medium mb-4">AVERAGE DELAY (min)</h3>
            <div className="h-48">
              <Recharts.BarChart data={buses} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Recharts.Bar dataKey="averageDelay" name="Delay" fill="orange" />
                <Recharts.XAxis dataKey="busNumber" />
                <Recharts.YAxis />
                <Recharts.Tooltip />
              </Recharts.BarChart>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-medium mb-4">COMPLETED TRIPS</h3>
            <div className="h-48">
              <Recharts.LineChart data={buses} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Recharts.Line type="monotone" dataKey="totalTrips" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Recharts.XAxis dataKey="busNumber" />
                <Recharts.YAxis />
                <Recharts.Tooltip />
              </Recharts.LineChart>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-medium mb-4">BUS STATUS</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="p-3">Bus</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">ETA</th>
                  <th className="p-3">Delay</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => {
                  const statusClass = bus.onTimePercentage > 80 ? "text-green-600" : bus.onTimePercentage > 60 ? "text-orange-600" : "text-red-600";
                  const delayMinutes = bus.delayed;
                  const delayText = delayMinutes > 0 ? `${delayMinutes} min` : "0 min";
                  
                  return (
                    <tr key={bus.busNumber} className="border-b border-gray-200">
                      <td className="p-3 font-medium">{bus.busNumber}</td>
                      <td className="p-3">Rahul</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>
                          {bus.onTimePercentage > 80 ? "🟢 On Time" : bus.onTimePercentage > 60 ? "🟡 Delayed" : "🔴 Off Track"}
                        </span>
                      </td>
                      <td className="p-3">Civil Lines</td>
                      <td className="p-3">5 min</td>
                      <td className="p-3">{delayText}</td>
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