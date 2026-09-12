export interface ETAResult {
  minutes: number;
  message: string;
  shouldLeaveNow: boolean;
  timeToLeave: number;
}

export interface Bus {
  busId: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE" | "ARRIVING";
}

export interface LiveLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}
