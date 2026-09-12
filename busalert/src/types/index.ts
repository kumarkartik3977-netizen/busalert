export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "student" | "driver" | "admin";
}

export interface Bus {
  busId: string;
  busNumber: string;
  driverId: string | null;
  routeId: string;
  status: "OFFLINE" | "ON_ROUTE" | "DELAYED";
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  lastUpdate: number;
}

export interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface Route {
  routeId: string;
  name: string;
  stops: RouteStop[];
}

export interface Trip {
  tripId: string;
  busId: string;
  startTime: number;
  endTime: number | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface LiveLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number;
}

export interface StudentPrefs {
  userId: string;
  busId: string;
  stopId: string;
  walkingTime: number; // in minutes
}

export interface ETAResult {
  minutes: number;
  message: string;
  shouldLeaveNow: boolean;
  timeToLeave: number; // minutes
}