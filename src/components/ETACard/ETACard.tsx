"use client";

import { useState, useEffect } from "react";
import { calculateETA } from "../lib/eta";

interface ETACardProps {
  busLocation: { latitude: number; longitude: number };
  destinationStop: { latitude: number; longitude: number; name: string };
  studentWalkingTime?: number;
}

export default function ETACard({ busLocation, destinationStop, studentWalkingTime = 5 }: ETACardProps) {
  const [etaResult, setETAResult] = useState<{
    minutes: number;
    message: string;
    shouldLeaveNow: boolean;
    timeToLeave: number;
  } | null>(null);

  useEffect(() => {
    const result = calculateETA(busLocation, destinationStop);
    setETAResult(result);
  }, [busLocation, destinationStop]);

  if (!etaResult) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="font-medium mb-3">ETA & Leave Now</h3>
      
      <div className="text-3xl font-extrabold {etaResult.shouldLeaveNow ? "text-red-600" : "text-primary"}">
        {etaResult.minutes} min
      </div>
      
      <p className="text-sm text-gray-500">ETA: {etaResult.message}</p>
      
      {etaResult.shouldLeaveNow && (
        <div className="mt-4 p-3 rounded-xl bg-red-100 text-red-800 border border-red-400">
          <p className="font-medium">🚨 LEAVE NOW</p>
          <p className="text-xs mt-1">Bus arriving in approximately {etaResult.minutes} minutes.</p>
          <p className="text-xs mt-1">Leave in {etaResult.timeToLeave <= 0 ? "1" : etaResult.timeToLeave} minute{etaResult.timeToLeave !== 1 ? "s" : ""}</p>
        </div>
      )}

      {!etaResult.shouldLeaveNow && etaResult.timeToLeave > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-green-100 text-green-800 border border-green-400">
          <p className="font-medium">🟢 You can leave in {etaResult.timeToLeave} minute{etaResult.timeToLeave !== 1 ? "s" : ""}</p>
          <p className="text-xs mt-1">ETA: {etaResult.minutes} min | Walk: {studentWalkingTime} min + Buffer: 2 min</p>
        </div>
      )}
    </div>
  );
}