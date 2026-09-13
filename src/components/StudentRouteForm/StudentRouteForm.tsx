"use client";

import { useState, useMemo } from "react";
import type { RouteStop, StudentRoute } from "@/types";

interface StudentRouteFormProps {
  stops: RouteStop[];
  savedRoute?: StudentRoute | null;
  onSave: (route: StudentRoute) => void;
  onCancel?: () => void;
}

export default function StudentRouteForm({ stops, savedRoute, onSave, onCancel }: StudentRouteFormProps) {
  const [originId, setOriginId] = useState(savedRoute?.originStopId || "");
  const [destinationId, setDestinationId] = useState(savedRoute?.destinationStopId || "");
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);

  const filteredOriginStops = useMemo(() => {
    if (!searchOrigin) return stops;
    const q = searchOrigin.toLowerCase();
    return stops.filter((s) => s.name.toLowerCase().includes(q));
  }, [stops, searchOrigin]);

  const filteredDestStops = useMemo(() => {
    if (!searchDest) return stops;
    const q = searchDest.toLowerCase();
    return stops.filter((s) => s.name.toLowerCase().includes(q));
  }, [stops, searchDest]);

  const selectedOrigin = stops.find((s) => s.stopId === originId);
  const selectedDest = stops.find((s) => s.stopId === destinationId);

  const isValid = originId && destinationId && originId !== destinationId;

  function handleSave() {
    if (!isValid || !selectedOrigin || !selectedDest) return;
    onSave({
      originStopId: originId,
      destinationStopId: destinationId,
      originName: selectedOrigin.name,
      destinationName: selectedDest.name,
      originLat: selectedOrigin.latitude,
      originLng: selectedOrigin.longitude,
      destinationLat: selectedDest.latitude,
      destinationLng: selectedDest.longitude,
    });
  }

  function handleSwap() {
    setOriginId(destinationId);
    setDestinationId(originId);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Set Your Route</h3>
        {savedRoute && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Select your pickup and drop-off bus stops
      </p>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow" />
            <span className="w-0.5 h-8 bg-gray-200" />
            <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Pickup Point</label>
              <input
                type="text"
                value={showOriginList ? searchOrigin : selectedOrigin?.name || ""}
                onChange={(e) => {
                  setSearchOrigin(e.target.value);
                  setShowOriginList(true);
                }}
                onFocus={() => setShowOriginList(true)}
                placeholder="Search pickup stop..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {showOriginList && (
                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredOriginStops.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">No stops found</p>
                  )}
                  {filteredOriginStops.map((stop) => (
                    <button
                      key={stop.stopId}
                      type="button"
                      onClick={() => {
                        setOriginId(stop.stopId);
                        setSearchOrigin("");
                        setShowOriginList(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors ${
                        stop.stopId === originId ? "bg-green-100 font-medium text-green-800" : "text-gray-700"
                      }`}
                    >
                      {stop.name}
                      {stop.annualFee !== undefined && stop.annualFee > 0 && (
                        <span className="ml-2 text-xs text-gray-400">₹{stop.annualFee.toLocaleString()}/yr</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Drop-off Point</label>
              <input
                type="text"
                value={showDestList ? searchDest : selectedDest?.name || ""}
                onChange={(e) => {
                  setSearchDest(e.target.value);
                  setShowDestList(true);
                }}
                onFocus={() => setShowDestList(true)}
                placeholder="Search drop-off stop..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {showDestList && (
                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredDestStops.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">No stops found</p>
                  )}
                  {filteredDestStops.map((stop) => (
                    <button
                      key={stop.stopId}
                      type="button"
                      onClick={() => {
                        setDestinationId(stop.stopId);
                        setSearchDest("");
                        setShowDestList(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 transition-colors ${
                        stop.stopId === destinationId ? "bg-red-100 font-medium text-red-800" : "text-gray-700"
                      }`}
                    >
                      {stop.name}
                      {stop.annualFee !== undefined && stop.annualFee > 0 && (
                        <span className="ml-2 text-xs text-gray-400">₹{stop.annualFee.toLocaleString()}/yr</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          title="Swap stops"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {originId && destinationId && originId === destinationId && (
        <p className="text-xs text-red-500">Pickup and drop-off must be different stops</p>
      )}

      {selectedOrigin && selectedDest && originId !== destinationId && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium text-green-700">{selectedOrigin.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="font-medium text-red-700">{selectedDest.name}</span>
          </div>
          {selectedOrigin.annualFee !== undefined && selectedOrigin.annualFee > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Annual Fee: ₹{selectedOrigin.annualFee.toLocaleString()} | Semester: ₹{selectedOrigin.semesterFee?.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {savedRoute ? "Update Route" : "Set Route"}
      </button>
    </div>
  );
}
