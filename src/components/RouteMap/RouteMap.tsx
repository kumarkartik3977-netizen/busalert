"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { isDemoMode, simulateBusMovement } from "@/lib/geolocation";

interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface MapProps {
  route: RouteStop[];
  currentPosition: { latitude: number; longitude: number } | null;
  currentStopIndex: number;
  nextStopIndex: number;
}

const stopIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const busIcon = L.divIcon({
  className: "custom-bus-marker",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:12px;color:white;">🚌</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitBounds({ route }: { route: RouteStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [route, map]);
  return null;
}

export default function RouteMap({ route, currentPosition, currentStopIndex, nextStopIndex }: MapProps) {
  const [demoProgress, setDemoProgress] = useState(0);

  useEffect(() => {
    if (!isDemoMode() || !currentPosition) return;
    const interval = setInterval(() => {
      setDemoProgress((prev) => {
        const next = prev + 0.03;
        if (next >= 1) {
          clearInterval(interval);
          return 1;
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [currentPosition]);

  const simPosition = isDemoMode() && route.length > 0
    ? (() => {
        const result = simulateBusMovement(route, demoProgress);
        return { latitude: result.latitude, longitude: result.longitude };
      })()
    : null;

  const center: [number, number] =
    route.length > 0
      ? [route[0].latitude, route[0].longitude]
      : [26.8467, 80.9462];

  const busPosition = isDemoMode()
    ? simPosition
    : currentPosition;

  const polylinePoints: [number, number][] = route.map((s) => [s.latitude, s.longitude]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-[450px]">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds route={route} />

          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.8 }}
          />

          {route.map((stop, i) => {
            let color = "#6b7280";
            if (i === currentStopIndex) color = "#10b981";
            else if (i === nextStopIndex) color = "#f59e0b";

            return (
              <Marker
                key={stop.stopId}
                position={[stop.latitude, stop.longitude]}
                icon={stopIcon(color)}
              >
                <Popup>
                  <strong>{stop.name}</strong>
                  <br />
                  {i === currentStopIndex && <span style={{ color: "#10b981" }}>Current Stop</span>}
                  {i === nextStopIndex && <span style={{ color: "#f59e0b" }}>Next Stop</span>}
                </Popup>
              </Marker>
            );
          })}

          {busPosition && (
            <Marker
              position={[busPosition.latitude, busPosition.longitude]}
              icon={busIcon}
            >
              <Popup>
                <strong>Bus Location</strong>
                <br />
                {busPosition.latitude.toFixed(4)}, {busPosition.longitude.toFixed(4)}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {isDemoMode() && (
          <div className="absolute top-3 left-3 z-[1000] bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">
            DEMO MODE
          </div>
        )}

        {isDemoMode() && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
            <button
              onClick={() => setDemoProgress(0)}
              className="py-1 px-3 rounded-md text-sm font-medium bg-white hover:bg-gray-100 transition-colors shadow"
            >
              Reset
            </button>
            <button
              onClick={() => setDemoProgress(0.5)}
              className="py-1 px-3 rounded-md text-sm font-medium bg-white hover:bg-gray-100 transition-colors shadow"
            >
              Midpoint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
