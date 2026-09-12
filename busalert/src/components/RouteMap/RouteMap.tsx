"use client";

import { useState, useEffect } from "react";
import { isDemoMode, setDemoMode, simulateBusMovement, getCurrentLocation } from "../lib/geolocation";
import { calculateETA } from "../lib/eta";

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

export default function RouteMap({ route, currentPosition, currentStopIndex, nextStopIndex }: MapProps) {
  const [demoProgress, setDemoProgress] = useState(0);

  useEffect(() => {
    if (isDemoMode()) {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          const newProgress = prev + 0.03;
          const result = simulateBusMovement(route, newProgress);
          
          if (newProgress >= 1) {
            clearInterval(interval);
          }
          return newProgress;
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isDemoMode, route]);

  return (
    <div className="bg-white rounded-2xl shadow-lg h-[450] overflow-hidden">
      <div className="h-full w-full relative">
        <div className="h-full w-full bg-gray-200">
          <svg className="absolute h-full w-full" aria-label="route-map">
            <path
              d={route.map((stop, i) => {
                if (i === 0) return `M ${stop.longitude} ${stop.latitude}`;
                const prev = route[i - 1];
                return `L ${stop.longitude} ${stop.latitude}`;
              }) || "M 0 0"}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="none"
            />
            {route.map((stop, i) => (
              <circle
                key={stop.stopId}
                cx={stop.longitude}
                cy={stop.latitude}
                r={8}
                fill={i === currentStopIndex ? "#10b981" : i === nextStopIndex ? "#f59e0b" : "#6b7280"}
              />
              <text
                key={`stop-label-${i}`}
                x={stop.longitude}
                y={stop.latitude - 12}
                textAnchor="middle"
                fontSize={10}
                fill="#374151"
              >
                {stop.name}
              </text>
            ))}
          </svg>
          
          {currentPosition && (
            <svg className="absolute -top-2 -right-2 w-8 h-8" aria-label="bus-marker">
              <circle cx={4} cy={4} r={3} fill="white" />
              <circle cx={4} cy={4} r={4} fill="#3b82f6" />
              <line x1={4} y1={1} x2={4} y2={5} stroke="#3b82f6" strokeWidth={1} />
              <line x1={3} y1={5} x2={5} y2={5} stroke="#3b82f6" strokeWidth={1} />
            </svg>
          )}
          
          {isDemoMode() && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
              DEMO MODE
            </div>
          )}
        </div>
        
        {isDemoMode() && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={() => setDemoProgress(0)}
              className="py-1 px-3 rounded-md text-sm font-medium bg-white hover:bg-gray-100 transition-colors"
              title="Reset"
            >
              Reset
            </button>
            <button
              onClick={() => setDemoProgress(0.5)}
              className="py-1 px-3 rounded-md text-sm font-medium bg-white hover:bg-gray-100 transition-colors"
              title="Pause/Resume"
            >
              Pause
            </button>
          </div>
        )}
      </div>
    </div>
  );
}