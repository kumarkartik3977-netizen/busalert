import type { Bus, Route, RouteStop, Trip, BusAnalytics, BusStop, BusLiveStatus } from "../types";

export const DEMO_STOPS: RouteStop[] = [
  { stopId: "stop-1", name: "College Campus", latitude: 26.8467, longitude: 80.9462, order: 0 },
  { stopId: "stop-2", name: "Civil Lines", latitude: 26.8580, longitude: 80.9500, order: 1 },
  { stopId: "stop-3", name: "Model Town", latitude: 26.8700, longitude: 80.9530, order: 2 },
  { stopId: "stop-4", name: "Clock Tower", latitude: 26.8800, longitude: 80.9560, order: 3 },
  { stopId: "stop-5", name: "Railway Station", latitude: 26.8900, longitude: 80.9600, order: 4 },
];

export const DEMO_ROUTES: Route[] = [
  {
    routeId: "route-1",
    name: "Route A — College to Railway Station",
    stops: DEMO_STOPS,
  },
  {
    routeId: "route-2",
    name: "Route B — College to Hazratganj",
    stops: [
      { stopId: "stop-1", name: "College Campus", latitude: 26.8467, longitude: 80.9462, order: 0 },
      { stopId: "stop-6", name: "Hazratganj", latitude: 26.8530, longitude: 80.9420, order: 1 },
      { stopId: "stop-7", name: "GPO", latitude: 26.8600, longitude: 80.9380, order: 2 },
      { stopId: "stop-8", name: "Kanpur Road", latitude: 26.8700, longitude: 80.9340, order: 3 },
    ],
  },
  {
    routeId: "route-3",
    name: "Route C — College to Aminabad",
    stops: [
      { stopId: "stop-1", name: "College Campus", latitude: 26.8467, longitude: 80.9462, order: 0 },
      { stopId: "stop-9", name: "Alambagh", latitude: 26.8400, longitude: 80.9500, order: 1 },
      { stopId: "stop-10", name: "Aminabad", latitude: 26.8350, longitude: 80.9550, order: 2 },
    ],
  },
];

export const DEMO_BUSES: Bus[] = [
  {
    busId: "bus-01",
    busNumber: "01",
    routeNumber: "A",
    routeName: "College to Railway Station",
    driverId: "driver-1",
    routeId: "route-1",
    currentStatus: "On Time",
    status: "ON_ROUTE",
    currentLocation: { latitude: 26.8520, longitude: 80.9480 },
    speed: 30,
    lastUpdate: Date.now(),
  },
  {
    busId: "bus-05",
    busNumber: "05",
    routeNumber: "A",
    routeName: "College to Railway Station",
    driverId: "driver-2",
    routeId: "route-1",
    currentStatus: "On Time",
    status: "ON_ROUTE",
    currentLocation: { latitude: 26.8650, longitude: 80.9510 },
    speed: 25,
    lastUpdate: Date.now(),
  },
  {
    busId: "bus-07",
    busNumber: "07",
    routeNumber: "B",
    routeName: "College to Hazratganj",
    driverId: "driver-3",
    routeId: "route-2",
    currentStatus: "Delayed",
    status: "DELAYED",
    currentLocation: { latitude: 26.8560, longitude: 80.9410 },
    speed: 15,
    lastUpdate: Date.now(),
  },
  {
    busId: "bus-12",
    busNumber: "12",
    routeNumber: "C",
    routeName: "College to Aminabad",
    driverId: "driver-4",
    routeId: "route-3",
    currentStatus: "Not Started",
    status: "OFFLINE",
    currentLocation: { latitude: 26.8467, longitude: 80.9462 },
    speed: 0,
    lastUpdate: Date.now(),
  },
];

export const DEMO_TRIPS: Trip[] = [
  { tripId: "trip-1", busId: "bus-01", driverId: "driver-1", routeId: "route-1", startTime: Date.now() - 1800000, endTime: null, status: "ACTIVE", currentStopIndex: 1, nextStopIndex: 2, delay: 0 },
  { tripId: "trip-2", busId: "bus-05", driverId: "driver-2", routeId: "route-1", startTime: Date.now() - 2400000, endTime: null, status: "ACTIVE", currentStopIndex: 2, nextStopIndex: 3, delay: 2 },
  { tripId: "trip-3", busId: "bus-07", driverId: "driver-3", routeId: "route-2", startTime: Date.now() - 3600000, endTime: null, status: "ACTIVE", currentStopIndex: 1, nextStopIndex: 2, delay: 8 },
];

export const DEMO_ANALYTICS: BusAnalytics[] = [
  { busId: "bus-01", busNumber: "01", onTime: 13, delayed: 2, totalTrips: 15, averageDelay: 3, onTimePercentage: 87, averageTripDuration: 45 },
  { busId: "bus-05", busNumber: "05", onTime: 11, delayed: 3, totalTrips: 12, averageDelay: 5, onTimePercentage: 92, averageTripDuration: 42 },
  { busId: "bus-07", busNumber: "07", onTime: 8, delayed: 4, totalTrips: 10, averageDelay: 8, onTimePercentage: 80, averageTripDuration: 50 },
  { busId: "bus-12", busNumber: "12", onTime: 9, delayed: 5, totalTrips: 14, averageDelay: 6, onTimePercentage: 64, averageTripDuration: 48 },
];

export const DEMO_SCHEDULE = {
  morning: "7:40 AM",
  return: "4:30 PM",
};

export const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "info" as const, title: "Bus departed", message: "Bus #01 has departed from College Campus", timestamp: Date.now() - 1800000, read: false },
  { id: "n2", type: "success" as const, title: "Civil Lines passed", message: "Bus #01 has passed Civil Lines", timestamp: Date.now() - 900000, read: false },
  { id: "n3", type: "warning" as const, title: "Bus delayed", message: "Bus #07 is running 8 minutes late", timestamp: Date.now() - 600000, read: false },
];

export function getRouteForBus(busId: string): Route | undefined {
  const bus = DEMO_BUSES.find(b => b.busId === busId);
  if (!bus) return undefined;
  return DEMO_ROUTES.find(r => r.routeId === bus.routeId);
}

export function getStopById(stopId: string): RouteStop | undefined {
  return [...DEMO_STOPS, ...DEMO_ROUTES.flatMap(r => r.stops)]
    .find(s => s.stopId === stopId);
}

export const DEMO_BUS_STOPS: BusStop[] = [
  // For bus-01 (route-1: College Campus to Railway Station)
  { id: "bs-1", busId: "bus-01", stopName: "College Campus", sequence: 1, latitude: 26.8467, longitude: 80.9462, scheduledArrival: "07:40", scheduledDeparture: "07:45", distanceFromStart: 0, platformNo: "A" },
  { id: "bs-2", busId: "bus-01", stopName: "Civil Lines", sequence: 2, latitude: 26.8580, longitude: 80.9500, scheduledArrival: "07:52", scheduledDeparture: "07:54", distanceFromStart: 1.5, platformNo: "B" },
  { id: "bs-3", busId: "bus-01", stopName: "Model Town", sequence: 3, latitude: 26.8700, longitude: 80.9530, scheduledArrival: "08:02", scheduledDeparture: "08:04", distanceFromStart: 3.2, platformNo: "A" },
  { id: "bs-4", busId: "bus-01", stopName: "Clock Tower", sequence: 4, latitude: 26.8800, longitude: 80.9560, scheduledArrival: "08:12", scheduledDeparture: "08:14", distanceFromStart: 4.8 },
  { id: "bs-5", busId: "bus-01", stopName: "Railway Station", sequence: 5, latitude: 26.8900, longitude: 80.9600, scheduledArrival: "08:20", scheduledDeparture: "08:25", distanceFromStart: 6.5, platformNo: "C" },

  // For bus-05 (route-1 same route)
  { id: "bs-6", busId: "bus-05", stopName: "College Campus", sequence: 1, latitude: 26.8467, longitude: 80.9462, scheduledArrival: "08:00", scheduledDeparture: "08:05", distanceFromStart: 0, platformNo: "A" },
  { id: "bs-7", busId: "bus-05", stopName: "Civil Lines", sequence: 2, latitude: 26.8580, longitude: 80.9500, scheduledArrival: "08:12", scheduledDeparture: "08:14", distanceFromStart: 1.5, platformNo: "B" },
  { id: "bs-8", busId: "bus-05", stopName: "Model Town", sequence: 3, latitude: 26.8700, longitude: 80.9530, scheduledArrival: "08:22", scheduledDeparture: "08:24", distanceFromStart: 3.2, platformNo: "A" },
  { id: "bs-9", busId: "bus-05", stopName: "Clock Tower", sequence: 4, latitude: 26.8800, longitude: 80.9560, scheduledArrival: "08:32", scheduledDeparture: "08:34", distanceFromStart: 4.8 },
  { id: "bs-10", busId: "bus-05", stopName: "Railway Station", sequence: 5, latitude: 26.8900, longitude: 80.9600, scheduledArrival: "08:40", scheduledDeparture: "08:45", distanceFromStart: 6.5, platformNo: "C" },

  // For bus-07 (route-2: College to Hazratganj)
  { id: "bs-11", busId: "bus-07", stopName: "College Campus", sequence: 1, latitude: 26.8467, longitude: 80.9462, scheduledArrival: "07:30", scheduledDeparture: "07:35", distanceFromStart: 0, platformNo: "D" },
  { id: "bs-12", busId: "bus-07", stopName: "Hazratganj", sequence: 2, latitude: 26.8530, longitude: 80.9420, scheduledArrival: "07:40", scheduledDeparture: "07:42", distanceFromStart: 1.2 },
  { id: "bs-13", busId: "bus-07", stopName: "GPO", sequence: 3, latitude: 26.8600, longitude: 80.9380, scheduledArrival: "07:48", scheduledDeparture: "07:50", distanceFromStart: 2.5, platformNo: "B" },
  { id: "bs-14", busId: "bus-07", stopName: "Kanpur Road", sequence: 4, latitude: 26.8700, longitude: 80.9340, scheduledArrival: "08:00", scheduledDeparture: "08:05", distanceFromStart: 4.0 },

  // For bus-12 (route-3: College to Aminabad)
  { id: "bs-15", busId: "bus-12", stopName: "College Campus", sequence: 1, latitude: 26.8467, longitude: 80.9462, scheduledArrival: "08:00", scheduledDeparture: "08:05", distanceFromStart: 0 },
  { id: "bs-16", busId: "bus-12", stopName: "Alambagh", sequence: 2, latitude: 26.8400, longitude: 80.9500, scheduledArrival: "08:15", scheduledDeparture: "08:17", distanceFromStart: 2.0 },
  { id: "bs-17", busId: "bus-12", stopName: "Aminabad", sequence: 3, latitude: 26.8350, longitude: 80.9550, scheduledArrival: "08:25", scheduledDeparture: "08:30", distanceFromStart: 3.5, platformNo: "A" },
];

export const DEMO_LIVE_STATUSES: BusLiveStatus[] = [
  {
    busId: "bus-01",
    currentLatitude: 26.8520,
    currentLongitude: 80.9480,
    currentSpeedKmph: 30,
    lastUpdatedStop: "College Campus",
    nextStop: "Civil Lines",
    distanceToNextStop: 1.1,
    estimatedArrivalAtNextStop: 2,
    delayInMinutes: 0,
    lastUpdatedAt: Date.now(),
    speedReadings: [28, 30, 32, 29, 31],
  },
  {
    busId: "bus-05",
    currentLatitude: 26.8650,
    currentLongitude: 80.9510,
    currentSpeedKmph: 25,
    lastUpdatedStop: "Civil Lines",
    nextStop: "Model Town",
    distanceToNextStop: 1.8,
    estimatedArrivalAtNextStop: 4,
    delayInMinutes: 2,
    lastUpdatedAt: Date.now(),
    speedReadings: [22, 25, 27, 24, 26],
  },
  {
    busId: "bus-07",
    currentLatitude: 26.8560,
    currentLongitude: 80.9410,
    currentSpeedKmph: 15,
    lastUpdatedStop: "College Campus",
    nextStop: "Hazratganj",
    distanceToNextStop: 0.8,
    estimatedArrivalAtNextStop: 3,
    delayInMinutes: 8,
    lastUpdatedAt: Date.now(),
    speedReadings: [12, 15, 18, 14, 16],
  },
];

export function getStopsForBus(busId: string): BusStop[] {
  return DEMO_BUS_STOPS.filter(s => s.busId === busId).sort((a, b) => a.sequence - b.sequence);
}

export function getLiveStatus(busId: string): BusLiveStatus | undefined {
  return DEMO_LIVE_STATUSES.find(s => s.busId === busId);
}
