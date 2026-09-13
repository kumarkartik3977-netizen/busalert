"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import { getFirebaseAuth } from "@/lib/firebase";
import { DEMO_ANALYTICS, DEMO_ROUTES, DEMO_BUSES, DEMO_DRIVERS } from "@/lib/demoData";
import type { Bus, Driver } from "@/types";
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
  const [buses, setBuses] = useState<Bus[]>(() => [...DEMO_BUSES]);
  const [drivers, setDrivers] = useState<Driver[]>(() => [...DEMO_DRIVERS]);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [showBusForm, setShowBusForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "buses" | "drivers">("overview");

  useEffect(() => {
    if (isDemoMode()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const analytics: BusAnalytics[] = DEMO_ANALYTICS.map((a) => ({
    ...a,
    offline: 0,
  }));

  const activeBuses = buses.length;
  const onTimeBuses = buses.filter(b => b.status === "ON_ROUTE").length;
  const delayedBuses = buses.filter(b => b.status === "DELAYED").length;
  const offlineBuses = buses.filter(b => b.status === "OFFLINE").length;

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

  function handleSaveBus(updated: Bus) {
    setBuses(prev => prev.map(b => b.busId === updated.busId ? updated : b));
    setEditingBus(null);
    setShowBusForm(false);
  }

  function handleSaveDriver(updated: Driver) {
    setDrivers(prev => {
      const exists = prev.find(d => d.driverId === updated.driverId);
      if (exists) return prev.map(d => d.driverId === updated.driverId ? updated : d);
      return [...prev, updated];
    });
    setEditingDriver(null);
    setShowDriverForm(false);
  }

  function handleDeleteDriver(driverId: string) {
    setDrivers(prev => prev.filter(d => d.driverId !== driverId));
    setEditingDriver(null);
    setShowDriverForm(false);
  }

  function getDriverForBus(busId: string): Driver | undefined {
    return drivers.find(d => d.busId === busId);
  }

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
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "overview" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("buses")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "buses" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Bus Management
          </button>
          <button
            onClick={() => setActiveTab("drivers")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "drivers" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Driver Details
          </button>
          <button
            onClick={() => router.push("/admin/stops")}
            className="px-4 py-2 rounded-lg font-semibold bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Bus Stops
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <p className="text-sm text-gray-600 font-medium">Total Buses</p>
                <p className="text-3xl font-bold text-gray-900">{activeBuses}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <p className="text-sm text-gray-600 font-medium">On Route</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {buses.map((bus) => {
                const status = bus.status === "ON_ROUTE" ? "ON_ROUTE" as const : bus.status === "DELAYED" ? "DELAYED" as const : "OFFLINE" as const;
                const route = DEMO_ROUTES.find(r => r.routeId === bus.routeId);
                const nextStopName = route?.stops[1]?.name || "—";

                return (
                  <BusCard
                    key={bus.busId}
                    busNumber={bus.busNumber}
                    eta={0}
                    status={status}
                    nextStop={nextStopName}
                    onSelect={() => router.push(`/tracking/${bus.busId}`)}
                  />
                );
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">BUS STATUS</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-300">
                      <th className="p-3 text-gray-900 font-bold">Bus</th>
                      <th className="p-3 text-gray-900 font-bold">Route</th>
                      <th className="p-3 text-gray-900 font-bold">Driver</th>
                      <th className="p-3 text-gray-900 font-bold">Time</th>
                      <th className="p-3 text-gray-900 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((bus) => {
                      const statusClass = bus.status === "ON_ROUTE" ? "text-green-700 bg-green-50" : bus.status === "DELAYED" ? "text-orange-700 bg-orange-50" : "text-gray-700 bg-gray-50";
                      const route = DEMO_ROUTES.find(r => r.routeId === bus.routeId);
                      const driver = getDriverForBus(bus.busId);

                      return (
                        <tr key={bus.busId} className="border-b border-gray-200">
                          <td className="p-3 font-bold text-gray-900">#{bus.busNumber}</td>
                          <td className="p-3 text-gray-800">{route?.name || "—"}</td>
                          <td className="p-3 text-gray-800">{driver?.name || "—"}</td>
                          <td className="p-3 text-gray-800">{bus.morningTime}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>
                              {bus.status === "ON_ROUTE" ? "🟢 On Route" : bus.status === "DELAYED" ? "🟡 Delayed" : "⚫ Offline"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "buses" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">BUS MANAGEMENT</h3>
              <p className="text-sm text-gray-500 mb-4">Edit bus number, timing, and current location</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buses.map((bus) => {
                  const driver = getDriverForBus(bus.busId);
                  const route = DEMO_ROUTES.find(r => r.routeId === bus.routeId);
                  return (
                    <div key={bus.busId} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">Bus #{bus.busNumber}</p>
                          <p className="text-sm text-gray-500">{route?.name || "No route"}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${bus.status === "ON_ROUTE" ? "bg-green-100 text-green-700" : bus.status === "DELAYED" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>
                          {bus.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Morning</p>
                          <p className="font-medium text-gray-900">{bus.morningTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Evening</p>
                          <p className="font-medium text-gray-900">{bus.eveningTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Driver</p>
                          <p className="font-medium text-gray-900">{driver?.name || "Not assigned"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium text-gray-900 text-xs">{bus.currentLocation.latitude.toFixed(4)}, {bus.currentLocation.longitude.toFixed(4)}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => { setEditingBus(bus); setShowBusForm(true); }}
                        className="mt-3 w-full px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors"
                      >
                        Edit Bus Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {showBusForm && editingBus && (
              <BusEditForm
                bus={editingBus}
                drivers={drivers}
                onSave={handleSaveBus}
                onCancel={() => { setEditingBus(null); setShowBusForm(false); }}
              />
            )}
          </div>
        )}

        {activeTab === "drivers" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">DRIVER DETAILS</h3>
                  <p className="text-sm text-gray-500">Manage driver information</p>
                </div>
                <button
                  onClick={() => { setEditingDriver(null); setShowDriverForm(true); }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  + Add Driver
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-300">
                      <th className="p-3 text-gray-900 font-bold">Name</th>
                      <th className="p-3 text-gray-900 font-bold">Age</th>
                      <th className="p-3 text-gray-900 font-bold">Mobile</th>
                      <th className="p-3 text-gray-900 font-bold">License</th>
                      <th className="p-3 text-gray-900 font-bold">Assigned Bus</th>
                      <th className="p-3 text-gray-900 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => {
                      const assignedBus = buses.find(b => b.busId === driver.busId);
                      return (
                        <tr key={driver.driverId} className="border-b border-gray-200">
                          <td className="p-3 font-bold text-gray-900">{driver.name}</td>
                          <td className="p-3 text-gray-800">{driver.age} yrs</td>
                          <td className="p-3 text-gray-800">{driver.mobile}</td>
                          <td className="p-3 text-gray-800 text-sm">{driver.licenseNo || "—"}</td>
                          <td className="p-3 text-gray-800">{assignedBus ? `#${assignedBus.busNumber}` : "—"}</td>
                          <td className="p-3">
                            <button
                              onClick={() => { setEditingDriver(driver); setShowDriverForm(true); }}
                              className="text-primary hover:underline text-sm font-semibold"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {showDriverForm && (
              <DriverForm
                driver={editingDriver}
                buses={buses}
                drivers={drivers}
                onSave={handleSaveDriver}
                onDelete={handleDeleteDriver}
                onCancel={() => { setEditingDriver(null); setShowDriverForm(false); }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function BusEditForm({ bus, drivers, onSave, onCancel }: { bus: Bus; drivers: Driver[]; onSave: (b: Bus) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    busNumber: bus.busNumber,
    morningTime: bus.morningTime,
    eveningTime: bus.eveningTime,
    status: bus.status,
    driverId: bus.driverId || "",
    latitude: bus.currentLocation.latitude,
    longitude: bus.currentLocation.longitude,
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-primary">
      <h3 className="font-bold text-gray-900 mb-4">Edit Bus #{bus.busNumber}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bus Number</label>
          <input
            type="text"
            value={form.busNumber}
            onChange={(e) => setForm(p => ({ ...p, busNumber: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm(p => ({ ...p, status: e.target.value as Bus["status"] }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ON_ROUTE">On Route</option>
            <option value="DELAYED">Delayed</option>
            <option value="OFFLINE">Offline</option>
            <option value="ARRIVING">Arriving</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Morning Time</label>
          <input
            type="text"
            value={form.morningTime}
            onChange={(e) => setForm(p => ({ ...p, morningTime: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. 07:00 AM"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Evening Time</label>
          <input
            type="text"
            value={form.eveningTime}
            onChange={(e) => setForm(p => ({ ...p, eveningTime: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. 04:30 PM"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Driver</label>
          <select
            value={form.driverId}
            onChange={(e) => setForm(p => ({ ...p, driverId: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">No driver</option>
            {drivers.map(d => (
              <option key={d.driverId} value={d.driverId}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Current Latitude</label>
          <input
            type="number"
            step={0.0001}
            value={form.latitude}
            onChange={(e) => setForm(p => ({ ...p, latitude: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Current Longitude</label>
          <input
            type="number"
            step={0.0001}
            value={form.longitude}
            onChange={(e) => setForm(p => ({ ...p, longitude: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSave({
            ...bus,
            busNumber: form.busNumber,
            morningTime: form.morningTime,
            eveningTime: form.eveningTime,
            status: form.status,
            driverId: form.driverId || null,
            currentLocation: { latitude: form.latitude, longitude: form.longitude },
          })}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DriverForm({ driver, buses, drivers, onSave, onDelete, onCancel }: { driver: Driver | null; buses: Bus[]; drivers: Driver[]; onSave: (d: Driver) => void; onDelete: (id: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: driver?.name || "",
    age: driver?.age || 0,
    mobile: driver?.mobile || "",
    licenseNo: driver?.licenseNo || "",
    busId: driver?.busId || "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    if (!form.name.trim() || !form.mobile.trim()) return;
    onSave({
      driverId: driver?.driverId || `driver-${Date.now()}`,
      name: form.name.trim(),
      age: form.age,
      mobile: form.mobile.trim(),
      licenseNo: form.licenseNo.trim() || undefined,
      busId: form.busId || undefined,
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-primary">
      <h3 className="font-bold text-gray-900 mb-4">{driver ? "Edit Driver" : "Add New Driver"}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Rajesh Kumar"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
          <input
            type="number"
            min={18}
            max={70}
            value={form.age || ""}
            onChange={(e) => setForm(p => ({ ...p, age: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. 35"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mobile <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm(p => ({ ...p, mobile: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. 9876543210"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">License No.</label>
          <input
            type="text"
            value={form.licenseNo}
            onChange={(e) => setForm(p => ({ ...p, licenseNo: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. DL-1234567890"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Assign Bus</label>
          <select
            value={form.busId}
            onChange={(e) => setForm(p => ({ ...p, busId: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">No bus assigned</option>
            {buses.map(b => {
              const assigned = drivers.find(d => d.busId === b.busId && d.driverId !== driver?.driverId);
              return (
                <option key={b.busId} value={b.busId} disabled={!!assigned}>
                  Bus #{b.busNumber} {assigned ? `(${assigned.name})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || !form.mobile.trim()}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {driver ? "Update Driver" : "Add Driver"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
      {driver && (
        <div className="mt-3">
          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(driver.driverId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Delete Driver
            </button>
          )}
        </div>
      )}
    </div>
  );
}
