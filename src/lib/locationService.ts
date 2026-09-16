import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export interface LocationPoint {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number;
  currentStopIndex: number;
  nextStopIndex: number;
  sequence: number;
}

export interface BusLocationSnapshot {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdatedAt: number;
  currentStopIndex: number;
  nextStopIndex: number;
  isOnline: boolean;
}

export async function saveLocationUpdate(point: LocationPoint): Promise<void> {
  const db = getFirebaseDb();

  const currentRef = doc(db, "busLocations", point.busId);
  const currentSnap = await getDoc(currentRef);
  const prevSequence = currentSnap.exists() ? (currentSnap.data().sequence || 0) + 1 : 1;

  await setDoc(currentRef, {
    busId: point.busId,
    latitude: point.latitude,
    longitude: point.longitude,
    speed: point.speed,
    lastUpdatedAt: point.timestamp,
    currentStopIndex: point.currentStopIndex,
    nextStopIndex: point.nextStopIndex,
    sequence: prevSequence,
    isOnline: true,
    updatedAt: serverTimestamp(),
  });

  const historyRef = doc(
    db,
    "busLocationHistory",
    point.busId,
    "points",
    `${point.timestamp}_${prevSequence}`
  );
  await setDoc(historyRef, {
    latitude: point.latitude,
    longitude: point.longitude,
    speed: point.speed,
    timestamp: point.timestamp,
    currentStopIndex: point.currentStopIndex,
    nextStopIndex: point.nextStopIndex,
    sequence: prevSequence,
    recordedAt: serverTimestamp(),
  });
}

export async function getCurrentBusLocation(busId: string): Promise<BusLocationSnapshot | null> {
  const db = getFirebaseDb();
  const ref = doc(db, "busLocations", busId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  const age = Date.now() - (data.lastUpdatedAt || 0);

  return {
    busId: data.busId,
    latitude: data.latitude,
    longitude: data.longitude,
    speed: data.speed,
    lastUpdatedAt: data.lastUpdatedAt,
    currentStopIndex: data.currentStopIndex,
    nextStopIndex: data.nextStopIndex,
    isOnline: age < 30000,
  };
}

export async function getAllBusLocations(): Promise<BusLocationSnapshot[]> {
  const db = getFirebaseDb();
  const ref = collection(db, "busLocations");
  const snap = await getDocs(ref);

  const locations: BusLocationSnapshot[] = [];
  snap.forEach((d) => {
    const data = d.data();
    const age = Date.now() - (data.lastUpdatedAt || 0);
    locations.push({
      busId: data.busId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      lastUpdatedAt: data.lastUpdatedAt,
      currentStopIndex: data.currentStopIndex,
      nextStopIndex: data.nextStopIndex,
      isOnline: age < 30000,
    });
  });

  return locations;
}

export async function getLocationHistory(
  busId: string,
  maxPoints: number = 100
): Promise<LocationPoint[]> {
  const db = getFirebaseDb();
  const ref = collection(db, "busLocationHistory", busId, "points");
  const q = query(ref, orderBy("sequence", "asc"), limit(maxPoints));
  const snap = await getDocs(q);

  const points: LocationPoint[] = [];
  snap.forEach((d) => {
    const data = d.data();
    points.push({
      busId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      timestamp: data.timestamp,
      currentStopIndex: data.currentStopIndex,
      nextStopIndex: data.nextStopIndex,
      sequence: data.sequence,
    });
  });

  return points;
}
