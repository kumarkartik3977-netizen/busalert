import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { AppRole, UserProfile } from "@/types";

const USERS_COLLECTION = "users";

export function getUserDocRef(uid: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(getUserDocRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt">
): Promise<UserProfile> {
  const profile: UserProfile = {
    ...data,
    uid,
    createdAt: Date.now(),
  };
  await setDoc(getUserDocRef(uid), profile);
  return profile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid">>
): Promise<void> {
  await updateDoc(getUserDocRef(uid), data);
}

export function getStoredRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("busalert_user_role");
  return role === "student" || role === "driver" || role === "admin" ? role : null;
}

export function storeRole(role: AppRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("busalert_user_role", role);
}

export function clearStoredRole(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("busalert_user_role");
}

export function dashboardPathForRole(role: AppRole): string {
  return `/${role}`;
}
