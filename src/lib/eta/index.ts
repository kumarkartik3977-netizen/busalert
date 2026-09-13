import type { ETAResult } from "../../types";

const WALKING_SPEED_KM_H = 5;
const SAFETY_BUFFER_MINUTES = 2;

export function calculateETA(
  busLocation: { latitude: number; longitude: number },
  destinationStop: { latitude: number; longitude: number },
  currentSpeed?: number,
  historicalData?: number
): ETAResult {
  const speed = currentSpeed || 30;
  const historicalAvg = historicalData || null;

  const distanceKm = haversineDistance(busLocation, destinationStop);

  const etaMinutes = Math.round((distanceKm / speed) * 60);

  const effectiveETA = historicalAvg !== null
    ? Math.round(historicalAvg * 0.7 + etaMinutes * 0.3)
    : etaMinutes;

  const walkingTimeMinutes = Math.round((distanceKm / WALKING_SPEED_KM_H) * 60);
  const timeToLeave = effectiveETA - walkingTimeMinutes - SAFETY_BUFFER_MINUTES;
  const shouldLeaveNow = timeToLeave <= 0;

  let message: string;
  if (effectiveETA <= 2) {
    message = `Bus is arriving at your stop now.`;
  } else if (shouldLeaveNow) {
    message = `Leave now! Bus arriving in approximately ${effectiveETA} minutes.`;
  } else {
    message = `You can leave in ${timeToLeave} minutes. Bus arrives in ${effectiveETA} min.`;
  }

  return {
    minutes: effectiveETA,
    message,
    shouldLeaveNow,
    timeToLeave: Math.max(0, timeToLeave),
  };
}

export function haversineDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}
