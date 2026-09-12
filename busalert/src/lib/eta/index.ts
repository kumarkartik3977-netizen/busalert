import type { ETAResult, Bus } from "../types";

// Average walking speed: ~5 km/h = 0.83 m/s
// Typical college walking speed assumed at 5 km/h

const WALKING_SPEED_KM_H = 5; // km/h
const SAFETY_BUFFER_MINUTES = 2; // minutes

/**
 * Calculate ETA and leave-now recommendation
 * 
 * @param busLocation Current bus { latitude, longitude }
 * @param destinationStop Target stop { latitude, longitude }
 * @param currentSpeed Current bus speed in km/h (optional)
 * @param historicalData Historical average time for this route in minutes (optional)
 * @returns ETA result with leave-now recommendation
 */
export function calculateETA(
  busLocation: { latitude: number; longitude: number },
  destinationStop: { latitude: number; longitude: number },
  currentSpeed?: number,
  historicalData?: number
): ETAResult {
  // Use current speed if provided, otherwise use default
  const speed = currentSpeed || 30; // default 30 km/h for bus
  
  // Use historical data if available, otherwise use speed-based calculation
  const historicalAvg = historicalData || null;
  
  // Simple distance-based ETA using Haversine formula approximation
  // For demo purposes, we'll calculate a realistic distance and ETA
  
  // Approximate conversion: 0.01 degrees ≈ 1.1 km
  const latDiff = destinationStop.latitude - busLocation.latitude;
  const lonDiff = destinationStop.longitude - busLocation.longitude;
  const distanceKm = Math.sqrt(latDiff ** 2 + lonDiff ** 2) * 111;
  
  // ETA in minutes = distance / speed * 60
  const etaMinutes = Math.round((distanceKm / speed) * 60);
  
  // Determine which ETA to use: historical if available and reasonable, otherwise calculated
  const effectiveETA = historicalAvg !== null 
    ? Math.round(historicalAvg * 0.7 + etaMinutes * 0.3) // weighted average
    : etaMinutes;
  
  // Calculate walking time to stop (in minutes)
  const walkingTimeMinutes = Math.round((distanceKm / WALKING_SPEED_KM_H) * 60);
  
  // Leave-now calculation: leave time = ETA - walking time - safety buffer
  const timeToLeave = effectiveETA - walkingTimeMinutes - SAFETY_BUFFER_MINUTES;
  const shouldLeaveNow = timeToLeave <= 0;
  
  let message: string;
  
  if (shouldLeaveNow) {
    message = `Leave now! Bus arriving in approximately ${effectiveETA} minutes.`;
  } else if (effectiveETA <= 2) {
    message = `🚌 Your bus is arriving at your stop.`;
  } else if (effectiveETA <= 10) {
    message = `🚌 Your bus is ${effectiveETA} minutes away.`;
  } else {
    message = `🚌 Your bus is ${effectiveETA} minutes away.`;
  }
  
  return {
    minutes: effectiveETA,
    message,
    shouldLeaveNow,
    timeToLeave: Math.max(0, timeToLeave),
  };
}
