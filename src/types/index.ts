export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "student" | "driver" | "admin";
}

export interface Driver {
  driverId: string;
  name: string;
  age: number;
  mobile: string;
  licenseNo?: string;
  busId?: string;
}

export interface Bus {
  busId: string;
  busNumber: string;
  routeNumber: string;
  routeName: string;
  driverId: string | null;
  routeId: string;
  currentStatus: "On Time" | "Delayed" | "Not Started";
  status: "OFFLINE" | "ON_ROUTE" | "DELAYED" | "ARRIVING";
  currentLocation: { latitude: number; longitude: number };
  speed: number;
  lastUpdate: number;
  morningTime: string;
  eveningTime: string;
}

export interface BusStop {
  id: string;
  busId: string;
  stopName: string;
  sequence: number;
  latitude: number;
  longitude: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  distanceFromStart: number;
  platformNo?: string;
  annualFee?: number;
  semesterFee?: number;
}

export interface BusLiveStatus {
  busId: string;
  currentLatitude: number;
  currentLongitude: number;
  currentSpeedKmph: number;
  lastUpdatedStop: string;
  nextStop: string;
  distanceToNextStop: number;
  estimatedArrivalAtNextStop: number;
  delayInMinutes: number;
  lastUpdatedAt: number;
  speedReadings: number[];
}

export interface StopETA {
  stopId: string;
  stopName: string;
  sequence: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  estimatedArrival: Date | null;
  actualArrival: Date | null;
  estimatedDeparture: Date | null;
  actualDeparture: Date | null;
  delayMinutes: number;
  distanceFromStart: number;
  platformNo?: string;
  status: "passed" | "current" | "upcoming";
  distanceFromCurrentLocation: number;
}

export interface RouteStop {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  annualFee?: number;
  semesterFee?: number;
}

export interface Route {
  routeId: string;
  name: string;
  stops: RouteStop[];
}

export interface Trip {
  tripId: string;
  busId: string;
  driverId: string;
  routeId: string;
  startTime: number;
  endTime: number | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  currentStopIndex: number;
  nextStopIndex: number;
  delay: number;
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
  walkingTime: number;
  originStopId?: string;
  destinationStopId?: string;
}

export interface StudentRoute {
  originStopId: string;
  destinationStopId: string;
  originName: string;
  destinationName: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

export interface ETAResult {
  minutes: number;
  message: string;
  shouldLeaveNow: boolean;
  timeToLeave: number;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface BusAnalytics {
  busId: string;
  busNumber: string;
  onTime: number;
  delayed: number;
  totalTrips: number;
  averageDelay: number;
  onTimePercentage: number;
  averageTripDuration: number;
}
