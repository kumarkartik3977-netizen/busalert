"use client";

import { useState, useEffect, type FormEvent } from "react";

interface BusStop {
  id: string;
  busId: string;
  stopName: string;
  sequence: number;
  latitude: number;
  longitude: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  distanceFromStart: number;
  platformNo?: string;
  annualFee?: number;
  semesterFee?: number;
}

interface AddStopFormProps {
  busId: string;
  existingStops: BusStop[];
  editingStop?: BusStop | null;
  onSave: (stop: BusStop) => void;
  onCancel: () => void;
  onDelete?: (stopId: string) => void;
}

const DEFAULT_FORM = {
  stopName: "",
  sequence: 1,
  latitude: 0,
  longitude: 0,
  scheduledArrival: "",
  scheduledDeparture: "",
  distanceFromStart: 0,
  platformNo: "",
};

export default function AddStopForm({
  busId,
  existingStops,
  editingStop = null,
  onSave,
  onCancel,
  onDelete,
}: AddStopFormProps) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [geoLoading, setGeoLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingStop) {
      setForm({
        stopName: editingStop.stopName,
        sequence: editingStop.sequence,
        latitude: editingStop.latitude,
        longitude: editingStop.longitude,
        scheduledArrival: editingStop.scheduledArrival,
        scheduledDeparture: editingStop.scheduledDeparture,
        distanceFromStart: editingStop.distanceFromStart,
        platformNo: editingStop.platformNo ?? "",
      });
    } else {
      setForm({ ...DEFAULT_FORM, sequence: existingStops.length + 1 });
    }
    setErrors({});
    setConfirmDelete(false);
  }, [editingStop, existingStops.length]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!form.stopName.trim()) e.stopName = "Stop name is required";
    if (!form.sequence || form.sequence < 1) e.sequence = "Sequence must be ≥ 1";
    if (form.latitude < -90 || form.latitude > 90) e.latitude = "Latitude must be between -90 and 90";
    if (form.longitude < -180 || form.longitude > 180) e.longitude = "Longitude must be between -180 and 180";
    if (!form.scheduledArrival) e.scheduledArrival = "Arrival time is required";
    if (!form.scheduledDeparture) e.scheduledDeparture = "Departure time is required";
    if (form.distanceFromStart < 0) e.distanceFromStart = "Distance must be ≥ 0";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    const stop: BusStop = {
      id: editingStop?.id ?? crypto.randomUUID(),
      busId,
      stopName: form.stopName.trim(),
      sequence: form.sequence,
      latitude: form.latitude,
      longitude: form.longitude,
      scheduledArrival: form.scheduledArrival,
      scheduledDeparture: form.scheduledDeparture,
      distanceFromStart: form.distanceFromStart,
      platformNo: form.platformNo.trim() || undefined,
    };

    onSave(stop);
    if (!editingStop) setForm({ ...DEFAULT_FORM, sequence: existingStops.length + 2 });
  }

  function useMapLocation() {
    if (!navigator.geolocation) {
      setErrors((p) => ({ ...p, latitude: "Geolocation not supported" }));
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setGeoLoading(false);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.latitude;
          delete next.longitude;
          return next;
        });
      },
      () => {
        setGeoLoading(false);
        setErrors((p) => ({ ...p, latitude: "Unable to retrieve location" }));
      }
    );
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete?.(editingStop!.id);
    setConfirmDelete(false);
  }

  const inputClass = (key: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary ${
      errors[key] ? "border-red-400 ring-red-300" : "border-gray-300"
    }`;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-5 space-y-4"
      >
        <h2 className="text-lg font-bold text-gray-900">
          {editingStop ? "Edit Stop" : "Add New Stop"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Stop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.stopName}
              onChange={(e) => update("stopName", e.target.value)}
              className={inputClass("stopName")}
              placeholder="e.g. Main Street Station"
            />
            {errors.stopName && <p className="text-xs text-red-500 mt-1">{errors.stopName}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Sequence / Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.sequence}
              onChange={(e) => update("sequence", Number(e.target.value))}
              className={inputClass("sequence")}
            />
            {errors.sequence && <p className="text-xs text-red-500 mt-1">{errors.sequence}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Distance from Start (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.distanceFromStart}
              onChange={(e) => update("distanceFromStart", Number(e.target.value))}
              className={inputClass("distanceFromStart")}
            />
            {errors.distanceFromStart && (
              <p className="text-xs text-red-500 mt-1">{errors.distanceFromStart}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step={0.000001}
              value={form.latitude || ""}
              onChange={(e) => update("latitude", Number(e.target.value))}
              className={inputClass("latitude")}
              placeholder="e.g. 28.6139"
            />
            {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step={0.000001}
              value={form.longitude || ""}
              onChange={(e) => update("longitude", Number(e.target.value))}
              className={inputClass("longitude")}
              placeholder="e.g. 77.2090"
            />
            {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Scheduled Arrival <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.scheduledArrival}
              onChange={(e) => update("scheduledArrival", e.target.value)}
              className={inputClass("scheduledArrival")}
            />
            {errors.scheduledArrival && (
              <p className="text-xs text-red-500 mt-1">{errors.scheduledArrival}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Scheduled Departure <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.scheduledDeparture}
              onChange={(e) => update("scheduledDeparture", e.target.value)}
              className={inputClass("scheduledDeparture")}
            />
            {errors.scheduledDeparture && (
              <p className="text-xs text-red-500 mt-1">{errors.scheduledDeparture}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Platform / Gate No.
            </label>
            <input
              type="text"
              value={form.platformNo}
              onChange={(e) => update("platformNo", e.target.value)}
              className={inputClass("platformNo")}
              placeholder="e.g. 3A (optional)"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={useMapLocation}
          disabled={geoLoading}
          className="w-full rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          {geoLoading ? "Fetching location..." : "Use Map Location"}
        </button>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            {editingStop ? "Update Stop" : "Add Stop"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {editingStop && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            {confirmDelete ? "Confirm Delete" : "Delete Stop"}
          </button>
        )}
      </form>

      {existingStops.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Existing Stops ({existingStops.length})
          </h3>
          <div className="divide-y divide-gray-100">
            {[...existingStops]
              .sort((a, b) => a.sequence - b.sequence)
              .map((stop) => (
                <div
                  key={stop.id}
                  className={`flex items-center gap-3 py-2.5 px-1 text-sm ${
                    editingStop?.id === stop.id ? "bg-primary/5 -mx-1 rounded-lg" : ""
                  }`}
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
                      onClick={() => {
                        onSave(stop);
                      }}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary"
                      title="Edit stop"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(stop.id)}
                        className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete stop"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
