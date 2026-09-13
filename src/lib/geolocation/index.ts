export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  error?: string;
}> {
  if (typeof window === "undefined") {
    return { latitude: 0, longitude: 0, error: "Server-side rendering" };
  }

  const demoMode = localStorage.getItem("busalert_demo_mode") === "true";
  if (demoMode) {
    return { latitude: 26.8467, longitude: 80.9462, error: "Demo mode - GPS unavailable" };
  }

  if (!("geolocation" in navigator)) {
    return { latitude: 0, longitude: 0, error: "Geolocation not supported" };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      });
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return { latitude: 0, longitude: 0, error: "Failed to get location" };
  }
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("busalert_demo_mode") === "true";
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem("busalert_demo_mode", "true");
  } else {
    localStorage.removeItem("busalert_demo_mode");
  }
}

export function simulateBusMovement(
  routeStops: Array<{ latitude: number; longitude: number }>,
  progress: number = 0
): {
  latitude: number;
  longitude: number;
  currentStopIndex: number;
  nextStopIndex: number;
  completed: boolean;
} {
  const totalSegments = routeStops.length - 1;
  const segmentProgress = Math.max(0, Math.min(1, progress));

  const currentSegmentIndex = Math.floor(segmentProgress * totalSegments);
  const stopProgress = (segmentProgress * totalSegments) % 1;

  const currentStopIndex = Math.min(currentSegmentIndex, totalSegments - 1);
  const nextStopIndex = Math.min(currentSegmentIndex + 1, totalSegments);

  const start = routeStops[currentStopIndex];
  const end = routeStops[nextStopIndex];

  const x = start.longitude + (end.longitude - start.longitude) * stopProgress;
  const y = start.latitude + (end.latitude - start.latitude) * stopProgress;

  return {
    latitude: y,
    longitude: x,
    currentStopIndex,
    nextStopIndex,
    completed: segmentProgress >= 1,
  };
}
