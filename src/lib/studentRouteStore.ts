import type { StudentRoute } from "@/types";

const STORAGE_KEY = "busalert_student_route";

const listeners = new Set<() => void>();
let cache: StudentRoute | null = null;
let loaded = false;

function readFromStorage(): StudentRoute | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StudentRoute) : null;
  } catch {
    return null;
  }
}

export function getStudentRoute(): StudentRoute | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    cache = readFromStorage();
    loaded = true;
  }
  return cache;
}

export function getServerStudentRoute(): StudentRoute | null {
  return null;
}

export function subscribeStudentRoute(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateStudentRoute(route: StudentRoute | null): void {
  cache = route;
  loaded = true;
  if (typeof window !== "undefined") {
    if (route) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(route));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  listeners.forEach((listener) => listener());
}
