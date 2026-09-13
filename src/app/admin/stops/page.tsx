"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import { DEMO_BUSES, getStopsForBus } from "@/lib/demoData";
import AddStopForm from "@/components/AddStopForm/AddStopForm";
import type { BusStop } from "@/types";

export default function ManageStopsPage() {
  const router = useRouter();
  const [selectedBusId, setSelectedBusId] = useState("");
  const [stops, setStops] = useState<BusStop[]>([]);
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isDemoMode()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (selectedBusId) {
      setStops(getStopsForBus(selectedBusId));
      setEditingStop(null);
      setShowForm(false);
    }
  }, [selectedBusId]);

  function handleSave(stop: BusStop) {
    setStops((prev) => {
      const existing = prev.find((s) => s.id === stop.id);
      if (existing) {
        return prev.map((s) => (s.id === stop.id ? stop : s)).sort((a, b) => a.sequence - b.sequence);
      }
      return [...prev, stop].sort((a, b) => a.sequence - b.sequence);
    });
    setEditingStop(null);
    setShowForm(false);
  }

  function handleDelete(stopId: string) {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
    setEditingStop(null);
    setShowForm(false);
  }

  function handleCancel() {
    setEditingStop(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">MANAGE BUS STOPS</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-xl shadow-md p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Bus Route
          </label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a bus...</option>
            {DEMO_BUSES.map((bus) => (
              <option key={bus.busId} value={bus.busId}>
                Bus {bus.busNumber} — {bus.routeName}
              </option>
            ))}
          </select>
        </div>

        {selectedBusId && (
          <>
            {!showForm && !editingStop && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98]"
              >
                + Add New Stop
              </button>
            )}

            {(showForm || editingStop) && (
              <AddStopForm
                busId={selectedBusId}
                existingStops={stops}
                editingStop={editingStop}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            )}

            {!showForm && !editingStop && stops.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Existing Stops ({stops.length})
                </h3>
                <div className="divide-y divide-gray-100">
                  {[...stops]
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((stop) => (
                      <div
                        key={stop.id}
                        className="flex items-center gap-3 py-2.5 px-1 text-sm"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {stop.sequence}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{stop.stopName}</p>
                          <p className="text-xs text-gray-500">
                            {stop.scheduledArrival} – {stop.scheduledDeparture}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingStop(stop)}
                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary"
                            title="Edit stop"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(stop.id)}
                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete stop"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {!showForm && !editingStop && stops.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500 text-sm">No stops found for this bus route. Add one to get started.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
