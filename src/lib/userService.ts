import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { AppRole, LoginRecord, UserProfile } from "@/types";

const USERS_COLLECTION = "users";
const LOGIN_RECORDS_COLLECTION = "loginRecords";

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

export async function recordSignIn(
  uid: string,
  email: string,
  name: string,
  role: AppRole
): Promise<void> {
  const now = Date.now();
  await updateDoc(getUserDocRef(uid), { lastSignInAt: now }).catch(() => {
    // User profile may not exist yet; create minimal profile
    const profile: UserProfile = {
      uid,
      email,
      name,
      role,
      createdAt: now,
      lastSignInAt: now,
    };
    return setDoc(getUserDocRef(uid), profile);
  });

  const loginRecordRef = doc(collection(getFirebaseDb(), LOGIN_RECORDS_COLLECTION));
  const record: LoginRecord = {
    id: loginRecordRef.id,
    uid,
    email,
    name,
    role,
    signInAt: now,
  };
  await setDoc(loginRecordRef, record);
}

export async function getRecentSignInUsers(maxCount: number = 50): Promise<LoginRecord[]> {
  const q = query(
    collection(getFirebaseDb(), LOGIN_RECORDS_COLLECTION),
    orderBy("signInAt", "desc"),
    limit(maxCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as LoginRecord);
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
