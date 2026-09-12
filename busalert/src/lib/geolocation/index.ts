import type { LiveLocation } from "../types";

/**
 * Get current browser location
 * Returns null if GPS unavailable or permission denied
 */
export async function getCurrentLocation(): Promise<{ 
  latitude: number; 
  longitude: number; 
  error?: string 
}> {
  // Check if we're in demo mode (no GPS permission)
  if (typeof window === "undefined") {
    return { latitude: 0, longitude: 0, error: "Server-side rendering" };
  }
  
  // Check for demo mode flag
  const demoMode = localStorage.getItem("busalert_demo_mode") === "true";
  if (demoMode) {
    // Return demo location - College campus coordinates as example
    return { 
      latitude: 28.7041, 
      longitude: 77.1025, 
      error: "Demo mode - GPS unavailable" 
    };
  }
  
  // Try to get browser geolocation
  if (!("geolocation" in navigator)) {
    return { latitude: 0, longitude: 0, error: "Geolocation not supported by this browser" };
  }
  
  try {
    const position = await navigator.geolocation.getCurrentPosition(
      (pos) => ({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        error: undefined,
      }),
      (err) => {
        // User denied permission
        return { 
          latitude: 0, 
          longitude: 0, 
          error: err.message || "Permission denied" 
        };
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      error: undefined,
    };
  } catch (err) {
    return { 
      latitude: 0, 
      longitude: 0, 
      error: "Failed to get location" 
    };
  }
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return localStorage.getItem("busalert_demo_mode") === "true";
}

/**
 * Toggle demo mode on/off
 */
export function setDemoMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem("busalert_demo_mode", "true");
  } else {
    localStorage.removeItem("busalert_demo_mode");
  }
}

/**
 * Simulated bus movement along a route
 * Returns the next position in the route based on time elapsed
 */
export function simulateBusMovement(
  routeStops: Array<{ latitude: number; longitude: number }>,
  progress: number = 0 // 0 to 1, representing progress along the route
): {
  latitude: number; 
  longitude: number; 
  currentStopIndex: number; 
  nextStopIndex: number; 
  completed: boolean 
} {
  const totalSegments = routeStops.length - 1;
  let segmentProgress = progress;
  
  // Determine current and next stop based on progress
  const currentSegmentIndex = Math.floor(segmentProgress * totalSegments);
  const stopProgress = (segmentProgress * totalSegments) % 1;
  
  const currentStopIndex = Math.min(currentSegmentIndex, totalSegments - 1);
  const nextStopIndex = Math.min(currentSegmentIndex + 1, totalSegments);
  
  // Interpolate position between current and next stop
  const start = routeStops[currentStopIndex];
  const end = routeStops[nextStopIndex];
  
  const x = start.longitude + (end.longitude - start.longitude) * stopProgress;
  const y = start.latitude + (end.latitude - start.latitude) * stopProgress;
  
  const completed = segmentProgress >= 1;
  
  return {
    latitude: y,
    longitude: x,
    currentStopIndex,
    nextStopIndex,
    completed,
  };
}