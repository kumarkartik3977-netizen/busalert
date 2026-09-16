"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
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

function createStopIcon(color: string, size: number = 12, isCurrent: boolean = false) {
  const glowShadow = isCurrent
    ? `box-shadow: 0 0 12px 4px ${color}40, 0 2px 6px rgba(0,0,0,0.3);`
    : `box-shadow: 0 1px 4px rgba(0,0,0,0.3);`;
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:2.5px solid white;${glowShadow}
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createBusIcon() {
  return L.divIcon({
    className: "bus-marker-icon",
    html: `
      <div class="bus-marker-glow" style="
        width:40px;height:40px;border-radius:50%;
        background:linear-gradient(135deg, #2563eb, #1d4ed8);
        border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        position:relative;
        transition: transform 0.3s ease;
      ">
        <div class="bus-pulse-ring" style="
          position:absolute;inset:-6px;border-radius:50%;
          border:2px solid rgba(37,99,235,0.4);
        "></div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="14" rx="2"/>
          <path d="M3 10h18"/>
          <path d="M7 21v-2"/>
          <path d="M17 21v-2"/>
          <circle cx="7" cy="15" r="1.5" fill="white" stroke="none"/>
          <circle cx="17" cy="15" r="1.5" fill="white" stroke="none"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function FitBounds({ route }: { route: RouteStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
}

function AnimatedBusMarker({ position, icon }: { position: L.LatLngExpression; icon: L.DivIcon }) {
  const map = useMap();
  const [smoothPos, setSmoothPos] = useState<[number, number]>(
    Array.isArray(position) ? position : [position as unknown as number, 0]
  );

  useEffect(() => {
    const target = Array.isArray(position) ? position : [position as unknown as number, 0];
    const start = [...smoothPos];
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setSmoothPos([
        start[0] + ((target as number[])[0] - start[0]) * eased,
        start[1] + ((target as number[])[1] - start[1]) * eased,
      ]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [position]);

  return <Marker position={smoothPos} icon={icon} />;
}

export default function RouteMap({ route, currentPosition, currentStopIndex, nextStopIndex }: MapProps) {
  const [demoProgress, setDemoProgress] = useState(0);

  useEffect(() => {
    if (!isDemoMode() || !currentPosition) return;
    const interval = setInterval(() => {
      setDemoProgress((prev) => {
        const next = prev + 0.02;
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

  const busPosition = isDemoMode() ? simPosition : currentPosition;

  const { completedPath, remainingPath } = useMemo(() => {
    if (!busPosition || route.length < 2) {
      return { completedPath: [], remainingPath: route.map((s) => [s.latitude, s.longitude] as [number, number]) };
    }

    const completed: [number, number][] = [];
    const remaining: [number, number][] = [];

    for (let i = 0; i <= currentStopIndex && i < route.length; i++) {
      completed.push([route[i].latitude, route[i].longitude]);
    }

    if (busPosition) {
      completed.push([busPosition.latitude, busPosition.longitude]);
      remaining.push([busPosition.latitude, busPosition.longitude]);
    }

    for (let i = nextStopIndex; i < route.length; i++) {
      remaining.push([route[i].latitude, route[i].longitude]);
    }

    return { completedPath: completed, remainingPath: remaining };
  }, [route, busPosition, currentStopIndex, nextStopIndex]);

  const busIcon = useMemo(() => createBusIcon(), []);

  const progress = route.length > 1 ? (currentStopIndex / (route.length - 1)) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-900">Route Map</h3>
          {busPosition && (
            <span className="text-xs text-gray-500">
              {busPosition.latitude.toFixed(4)}, {busPosition.longitude.toFixed(4)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-green-500 inline-block" />
            <span className="text-gray-600">Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-gray-300 inline-block border-dashed" />
            <span className="text-gray-600">Remaining</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-gray-600">Bus</span>
          </span>
        </div>
      </div>

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

          {/* Remaining route - dashed gray */}
          {remainingPath.length > 1 && (
            <Polyline
              positions={remainingPath}
              pathOptions={{
                color: "#9ca3af",
                weight: 3,
                opacity: 0.6,
                dashArray: "8 6",
                lineCap: "round",
              }}
            />
          )}

          {/* Completed route - solid green */}
          {completedPath.length > 1 && (
            <Polyline
              positions={completedPath}
              pathOptions={{
                color: "#22c55e",
                weight: 4,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          )}

          {/* Stop markers */}
          {route.map((stop, i) => {
            const isPassed = i < currentStopIndex;
            const isCurrent = i === currentStopIndex;
            const isNext = i === nextStopIndex;
            const isFuture = i > nextStopIndex;

            let color = "#9ca3af";
            let size = 10;
            if (isPassed) { color = "#22c55e"; size = 10; }
            if (isCurrent) { color = "#16a34a"; size = 14; }
            if (isNext) { color = "#f59e0b"; size = 12; }
            if (isFuture) { color = "#d1d5db"; size = 8; }

            return (
              <CircleMarker
                key={stop.stopId}
                center={[stop.latitude, stop.longitude]}
                radius={size / 2}
                pathOptions={{
                  color: "white",
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <div style={{ minWidth: 120 }}>
                    <strong style={{ fontSize: 13 }}>{stop.name}</strong>
                    <br />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Stop #{i + 1}</span>
                    {isCurrent && (
                      <div style={{ marginTop: 4, color: "#16a34a", fontWeight: 600, fontSize: 12 }}>
                        Current Stop
                      </div>
                    )}
                    {isNext && (
                      <div style={{ marginTop: 4, color: "#f59e0b", fontWeight: 600, fontSize: 12 }}>
                        Next Stop
                      </div>
                    )}
                    {isPassed && (
                      <div style={{ marginTop: 4, color: "#22c55e", fontSize: 12 }}>
                        Passed
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Animated bus marker */}
          {busPosition && (
            <AnimatedBusMarker
              position={[busPosition.latitude, busPosition.longitude]}
              icon={busIcon}
            />
          )}
        </MapContainer>

        {/* Progress overlay */}
        {busPosition && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span className="text-xs font-bold text-gray-900">Live Tracking</span>
            </div>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              {currentStopIndex + 1} / {route.length} stops
            </p>
          </div>
        )}

        {isDemoMode() && (
          <div className="absolute top-3 right-3 z-[1000] bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">
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
