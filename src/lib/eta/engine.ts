import { BusStop, StopETA } from "../../types";

export function haversineDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function smoothSpeed(speedReadings: number[], newSpeed: number): number[] {
  speedReadings.push(newSpeed);
  if (speedReadings.length > 5) {
    speedReadings.shift();
  }
  return speedReadings;
}

function parseTime(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function calculateStopETAs(
  stops: BusStop[],
  currentLat: number,
  currentLng: number,
  currentSpeedKmph: number,
  speedReadings: number[],
  currentTime: Date
): StopETA[] {
  const smoothedSpeed =
    speedReadings.length > 0
      ? speedReadings.reduce((a, b) => a + b, 0) / speedReadings.length
      : currentSpeedKmph;

  const effectiveSpeed = smoothedSpeed > 0 ? smoothedSpeed : 25;

  let currentFound = false;

  return stops.map((stop) => {
    const distanceKm = haversineDistance(
      { latitude: currentLat, longitude: currentLng },
      { latitude: stop.latitude, longitude: stop.longitude }
    );

    const roadDistance = distanceKm * 1.3;
    const distanceMeters = roadDistance * 1000;

    let status: "passed" | "current" | "upcoming";
    if (distanceMeters < 150) {
      status = "passed";
    } else if (!currentFound) {
      status = "current";
      currentFound = true;
    } else {
      status = "upcoming";
    }

    const etaHours = roadDistance / effectiveSpeed;
    const estimatedArrival = new Date(currentTime.getTime() + etaHours * 3600000);
    const estimatedDeparture = new Date(estimatedArrival.getTime() + 30000);

    const scheduledArrivalDate = parseTime(currentTime, stop.scheduledArrival);
    const scheduledDepartureDate = parseTime(currentTime, stop.scheduledDeparture);

    const delayMinutes =
      (estimatedArrival.getTime() - scheduledArrivalDate.getTime()) / 60000;

    return {
      stopId: stop.id,
      stopName: stop.stopName,
      sequence: stop.sequence,
      scheduledArrival: stop.scheduledArrival,
      scheduledDeparture: stop.scheduledDeparture,
      estimatedArrival,
      actualArrival: null,
      estimatedDeparture,
      actualDeparture: null,
      delayMinutes,
      distanceFromStart: stop.distanceFromStart,
      platformNo: stop.platformNo,
      status,
      distanceFromCurrentLocation: distanceMeters,
    };
  });
}

export function detectGeofenceArrival(
  busLat: number,
  busLng: number,
  stopLat: number,
  stopLng: number,
  radiusMeters: number = 150
): boolean {
  const distanceKm = haversineDistance(
    { latitude: busLat, longitude: busLng },
    { latitude: stopLat, longitude: stopLng }
  );
  return distanceKm * 1000 <= radiusMeters;
}
