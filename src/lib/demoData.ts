import type { Bus, Route, RouteStop, Trip, BusAnalytics, BusStop, BusLiveStatus, Driver } from "../types";

export const DEMO_STOPS: RouteStop[] = [
  // Delhi / Sangam Vihar area (high fees)
  { stopId: "stop-1", name: "Saket School", latitude: 28.5186, longitude: 77.2082, order: 0, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-2", name: "Khanpur", latitude: 28.5240, longitude: 77.2130, order: 1, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-3", name: "Dewli Mor", latitude: 28.5300, longitude: 77.2180, order: 2, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-4", name: "Tigri", latitude: 28.5350, longitude: 77.2230, order: 3, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-5", name: "Sangam Vihar Delhi", latitude: 28.5400, longitude: 77.2280, order: 4, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-6", name: "Batra Hospital", latitude: 28.5450, longitude: 77.2330, order: 5, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-7", name: "Okhla Mod", latitude: 28.5500, longitude: 77.2380, order: 6, annualFee: 48000, semesterFee: 24000 },
  { stopId: "stop-8", name: "Jaitpur Mod", latitude: 28.5550, longitude: 77.2430, order: 7, annualFee: 48000, semesterFee: 24000 },
  // Badarpur / Faridabad border
  { stopId: "stop-9", name: "Badarpur Border", latitude: 28.5600, longitude: 77.2480, order: 8, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-10", name: "Naya Pul By Pass", latitude: 28.5650, longitude: 77.2530, order: 9, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-11", name: "Khedi Pull", latitude: 28.5700, longitude: 77.2580, order: 10, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-12", name: "Sector-18 By Pass", latitude: 28.5750, longitude: 77.2630, order: 11, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-13", name: "SRS Pass", latitude: 28.5800, longitude: 77.2680, order: 12, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-14", name: "BPTP", latitude: 28.5850, longitude: 77.2730, order: 13, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-15", name: "Girls Hostel FBD", latitude: 28.5900, longitude: 77.2780, order: 14, annualFee: 0, semesterFee: 0 },
  { stopId: "stop-16", name: "SEC-17 CNG FBD", latitude: 28.5950, longitude: 77.2830, order: 15, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-17", name: "SEC-29 FBD", latitude: 28.6000, longitude: 77.2880, order: 16, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-18", name: "Sec-8 FBD", latitude: 28.6050, longitude: 77.2930, order: 17, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-19", name: "SEC-3 FBD", latitude: 28.6100, longitude: 77.2980, order: 18, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-20", name: "Tigaon By Pass", latitude: 28.6150, longitude: 77.3030, order: 19, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-21", name: "IMT Ballabhgarh", latitude: 28.6200, longitude: 77.3080, order: 20, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-22", name: "Chandwali Pull", latitude: 28.6250, longitude: 77.3130, order: 21, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-23", name: "Jat Chowk", latitude: 28.6300, longitude: 77.3180, order: 22, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-24", name: "Bodali", latitude: 28.6350, longitude: 77.3230, order: 23, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-25", name: "Sarvodaya Chowk", latitude: 28.6400, longitude: 77.3280, order: 24, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-26", name: "Ballabhgarh", latitude: 28.6450, longitude: 77.3330, order: 25, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-27", name: "Sahupura", latitude: 28.6500, longitude: 77.3380, order: 26, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-28", name: "Jajru Mod", latitude: 28.6550, longitude: 77.3430, order: 27, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-29", name: "Old Metro", latitude: 28.6600, longitude: 77.3480, order: 28, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-30", name: "Neelam Chowk", latitude: 28.6650, longitude: 77.3530, order: 29, annualFee: 42000, semesterFee: 21000 },
  { stopId: "stop-31", name: "Mulla Hotel", latitude: 28.6700, longitude: 77.3580, order: 30, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-32", name: "Majid Mod", latitude: 28.6750, longitude: 77.3630, order: 31, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-33", name: "SGM Nagar NIT-3 Faridabad", latitude: 28.6800, longitude: 77.3680, order: 32, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-34", name: "3No. Pulya", latitude: 28.6850, longitude: 77.3730, order: 33, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-35", name: "Payali Chowk", latitude: 28.6900, longitude: 77.3780, order: 34, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-36", name: "Hardware", latitude: 28.6950, longitude: 77.3830, order: 35, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-37", name: "Bata Chowk", latitude: 28.7000, longitude: 77.3880, order: 36, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-38", name: "Goodyear", latitude: 28.7050, longitude: 77.3930, order: 37, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-39", name: "Ballabgarh", latitude: 28.7100, longitude: 77.3980, order: 38, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-40", name: "JCB Chowk", latitude: 28.7150, longitude: 77.4030, order: 39, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-41", name: "Saut Sudras (Sikri)", latitude: 28.7200, longitude: 77.4080, order: 40, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-42", name: "Sikari", latitude: 28.7250, longitude: 77.4130, order: 41, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-43", name: "Agwanpur", latitude: 28.7300, longitude: 77.4180, order: 42, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-44", name: "Rohan Motars", latitude: 28.7350, longitude: 77.4230, order: 43, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-45", name: "Omaxe City", latitude: 28.7400, longitude: 77.4280, order: 44, annualFee: 18000, semesterFee: 9000 },
  // Hodal / Palwal area
  { stopId: "stop-46", name: "Committee Chowk", latitude: 27.8900, longitude: 77.3700, order: 45, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-47", name: "Housing Board Colony", latitude: 27.8950, longitude: 77.3750, order: 46, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-48", name: "Hudda Chowk", latitude: 27.9000, longitude: 77.3800, order: 47, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-49", name: "Alawalpur Chowk", latitude: 27.9050, longitude: 77.3850, order: 48, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-50", name: "Bus Stand", latitude: 27.9100, longitude: 77.3900, order: 49, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-51", name: "Kithwari Chowk", latitude: 27.9150, longitude: 77.3950, order: 50, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-52", name: "Sukhram Hospital", latitude: 27.9200, longitude: 77.4000, order: 51, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-53", name: "Rasulpur Chowk", latitude: 27.9250, longitude: 77.4050, order: 52, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-54", name: "Agar Chowk", latitude: 27.9300, longitude: 77.4100, order: 53, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-55", name: "Camp", latitude: 27.9350, longitude: 77.4150, order: 54, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-56", name: "Mandhkola", latitude: 27.9400, longitude: 77.4200, order: 55, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-57", name: "Hathin", latitude: 27.9450, longitude: 77.4250, order: 56, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-58", name: "Gahlab", latitude: 27.9500, longitude: 77.4300, order: 57, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-59", name: "Aurangabad", latitude: 27.9550, longitude: 77.4350, order: 58, annualFee: 15000, semesterFee: 7500 },
  { stopId: "stop-60", name: "Rawai Patti", latitude: 27.9600, longitude: 77.4400, order: 59, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-61", name: "M.K.M College", latitude: 27.9650, longitude: 77.4450, order: 60, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-62", name: "White Murti", latitude: 27.9700, longitude: 77.4500, order: 61, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-63", name: "Black Murti", latitude: 27.9750, longitude: 77.4550, order: 62, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-64", name: "Panch Colony", latitude: 27.9800, longitude: 77.4600, order: 63, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-65", name: "Police Thana", latitude: 27.9850, longitude: 77.4650, order: 64, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-66", name: "Punahana Mod", latitude: 27.9900, longitude: 77.4700, order: 65, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-67", name: "Aakash Mart", latitude: 27.9950, longitude: 77.4750, order: 66, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-68", name: "Gardhari Diary", latitude: 28.0000, longitude: 77.4800, order: 67, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-69", name: "Ghari Mode", latitude: 28.0050, longitude: 77.4850, order: 68, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-70", name: "PNB Bank Hodal", latitude: 28.0100, longitude: 77.4900, order: 69, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-71", name: "Mundkati Railway Station", latitude: 28.0150, longitude: 77.4950, order: 70, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-72", name: "Royal Enfield Agency", latitude: 28.0200, longitude: 77.5000, order: 71, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-73", name: "Shyam Mandir", latitude: 28.0250, longitude: 77.5050, order: 72, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-74", name: "Prabhu Dairy", latitude: 28.0300, longitude: 77.5100, order: 73, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-75", name: "Hodal Station", latitude: 28.0350, longitude: 77.5150, order: 74, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-76", name: "Jamidar Petrol Pump", latitude: 28.0400, longitude: 77.5200, order: 75, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-77", name: "Banchari", latitude: 28.0450, longitude: 77.5250, order: 76, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-78", name: "Tumasra", latitude: 28.0500, longitude: 77.5300, order: 77, annualFee: 15000, semesterFee: 7500 },
  { stopId: "stop-79", name: "Bhiduki", latitude: 28.0550, longitude: 77.5350, order: 78, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-80", name: "Bhandoli", latitude: 28.0600, longitude: 77.5400, order: 79, annualFee: 38000, semesterFee: 19000 },
  { stopId: "stop-81", name: "Hassanpur", latitude: 28.0650, longitude: 77.5450, order: 80, annualFee: 32000, semesterFee: 16000 },
  { stopId: "stop-82", name: "Likhi", latitude: 28.0700, longitude: 77.5500, order: 81, annualFee: 27000, semesterFee: 13500 },
  { stopId: "stop-83", name: "Khambi", latitude: 28.0750, longitude: 77.5550, order: 82, annualFee: 21000, semesterFee: 10500 },
  { stopId: "stop-84", name: "Bhopgarh", latitude: 28.0800, longitude: 77.5600, order: 83, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-85", name: "Pigore", latitude: 28.0850, longitude: 77.5650, order: 84, annualFee: 18000, semesterFee: 9000 },
  { stopId: "stop-86", name: "Deeghot", latitude: 28.0900, longitude: 77.5700, order: 85, annualFee: 15000, semesterFee: 7500 },
];

export const DEMO_ROUTES: Route[] = [
  {
    routeId: "route-1",
    name: "Route A — Delhi to Hodal (via Sangam Vihar)",
    stops: DEMO_STOPS.filter(s => s.order <= 44),
  },
  {
    routeId: "route-2",
    name: "Route B — Faridabad to Hodal",
    stops: DEMO_STOPS.filter(s => s.order >= 14 && s.order <= 60),
  },
  {
    routeId: "route-3",
    name: "Route C — Ballabhgarh to Hodal",
    stops: DEMO_STOPS.filter(s => s.order >= 25 && s.order <= 74),
  },
  {
    routeId: "route-4",
    name: "Route D — Hodal Local",
    stops: DEMO_STOPS.filter(s => s.order >= 45),
  },
];

export const DEMO_DRIVERS: Driver[] = [
  { driverId: "driver-1", name: "Rajesh Kumar", age: 35, mobile: "9876543210", licenseNo: "DL-1234567890", busId: "bus-01" },
  { driverId: "driver-2", name: "Suresh Singh", age: 42, mobile: "9876543211", licenseNo: "DL-9876543210", busId: "bus-05" },
  { driverId: "driver-3", name: "Mahesh Sharma", age: 38, mobile: "9876543212", licenseNo: "DL-5678901234", busId: "bus-07" },
  { driverId: "driver-4", name: "Dinesh Patel", age: 45, mobile: "9876543213", licenseNo: "DL-4321098765", busId: "bus-12" },
];

export const DEMO_BUSES: Bus[] = [
  {
    busId: "bus-01",
    busNumber: "01",
    routeNumber: "A",
    routeName: "Delhi to Hodal",
    driverId: "driver-1",
    routeId: "route-1",
    currentStatus: "On Time",
    status: "ON_ROUTE",
    currentLocation: { latitude: 28.5600, longitude: 77.2480 },
    speed: 30,
    lastUpdate: Date.now(),
    morningTime: "07:00 AM",
    eveningTime: "04:30 PM",
  },
  {
    busId: "bus-05",
    busNumber: "05",
    routeNumber: "B",
    routeName: "Faridabad to Hodal",
    driverId: "driver-2",
    routeId: "route-2",
    currentStatus: "On Time",
    status: "ON_ROUTE",
    currentLocation: { latitude: 28.6200, longitude: 77.3080 },
    speed: 25,
    lastUpdate: Date.now(),
    morningTime: "07:30 AM",
    eveningTime: "05:00 PM",
  },
  {
    busId: "bus-07",
    busNumber: "07",
    routeNumber: "C",
    routeName: "Ballabhgarh to Hodal",
    driverId: "driver-3",
    routeId: "route-3",
    currentStatus: "Delayed",
    status: "DELAYED",
    currentLocation: { latitude: 28.7100, longitude: 77.3980 },
    speed: 15,
    lastUpdate: Date.now(),
    morningTime: "06:45 AM",
    eveningTime: "04:00 PM",
  },
  {
    busId: "bus-12",
    busNumber: "12",
    routeNumber: "D",
    routeName: "Hodal Local",
    driverId: "driver-4",
    routeId: "route-4",
    currentStatus: "Not Started",
    status: "OFFLINE",
    currentLocation: { latitude: 27.9100, longitude: 77.3900 },
    speed: 0,
    lastUpdate: Date.now(),
    morningTime: "08:00 AM",
    eveningTime: "05:30 PM",
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
