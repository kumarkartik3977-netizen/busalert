"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import {
  clearStoredRole,
  createUserProfile,
  dashboardPathForRole,
  getStoredRole,
  getUserProfile,
  recordSignIn,
  storeRole,
  updateUserProfile,
} from "@/lib/userService";
import type { AppRole, StudentSignUpData, UserProfile } from "@/types";

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: AppRole | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string, selectedRole?: AppRole) => Promise<AppRole>;
  signUpStudent: (data: StudentSignUpData) => Promise<void>;
  demoLogin: (role: AppRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function firebaseAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/configuration-not-found":
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled. Please contact support.";
    case "auth/api-key-not-valid":
      return "Invalid Firebase configuration. Please contact support.";
    default:
      return err instanceof Error ? err.message : "Authentication failed.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      if (isDemoMode()) {
        const demoRole = getStoredRole() ?? "student";
        setIsDemo(true);
        setUser(null);
        setProfile(null);
        setRole(demoRole);
        setLoading(false);
        return;
      }

      setIsDemo(false);

      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(fbUser);

      try {
        let userProfile = await getUserProfile(fbUser.uid);
        if (!userProfile) {
          const legacyRole = getStoredRole() ?? "student";
          userProfile = await createUserProfile(fbUser.uid, {
            email: fbUser.email ?? "",
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            role: legacyRole,
          });
        }
        setProfile(userProfile);
        setRole(userProfile.role);
        storeRole(userProfile.role);
      } catch {
        const fallbackRole = getStoredRole() ?? "student";
        setRole(fallbackRole);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const resolveRole = useCallback(async (fbUser: FirebaseUser): Promise<AppRole> => {
    try {
      let userProfile = await getUserProfile(fbUser.uid);
      if (!userProfile) {
        const legacyRole = getStoredRole() ?? "student";
        userProfile = await createUserProfile(fbUser.uid, {
          email: fbUser.email ?? "",
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          role: legacyRole,
        });
      }
      setProfile(userProfile);
      storeRole(userProfile.role);
      return userProfile.role;
    } catch {
      const fallbackRole = getStoredRole() ?? "student";
      return fallbackRole;
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, selectedRole?: AppRole): Promise<AppRole> => {
      try {
        const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        let resolvedRole = await resolveRole(cred.user);

        if (selectedRole && selectedRole !== resolvedRole) {
          await updateUserProfile(cred.user.uid, { role: selectedRole });
          resolvedRole = selectedRole;
        }

        setProfile((prev) => (prev ? { ...prev, role: resolvedRole } : prev));
        setRole(resolvedRole);
        storeRole(resolvedRole);

        const displayName =
          cred.user.displayName || cred.user.email?.split("@")[0] || "User";
        await recordSignIn(
          cred.user.uid,
          cred.user.email ?? email,
          displayName,
          resolvedRole
        );

        return resolvedRole;
      } catch (err) {
        throw new Error(firebaseAuthErrorMessage(err));
      }
    },
    [resolveRole]
  );

  const signUpStudent = useCallback(
    async (data: StudentSignUpData): Promise<void> => {
      try {
        const cred = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          data.email,
          data.password
        );
        await updateProfile(cred.user, { displayName: data.name });
        const newProfile = await createUserProfile(cred.user.uid, {
          email: data.email,
          name: data.name,
          role: "student",
          mobile: data.mobile,
          branch: data.branch,
          rollNo: data.rollNo,
          routeId: data.routeId,
          routeName: data.routeName,
          boardingStopId: data.boardingStopId,
          boardingStopName: data.boardingStopName,
          destinationStopId: data.destinationStopId,
          destinationStopName: data.destinationStopName,
        });
        setUser(cred.user);
        setProfile(newProfile);
        setRole("student");
        storeRole("student");
        await recordSignIn(cred.user.uid, data.email, data.name, "student");
      } catch (err) {
        throw new Error(firebaseAuthErrorMessage(err));
      }
    },
    []
  );

  const demoLogin = useCallback(
    (demoRole: AppRole) => {
      setDemoMode(true);
      storeRole(demoRole);
      setUser(null);
      setProfile(null);
      setRole(demoRole);
      setIsDemo(true);
      setLoading(false);
      router.push(dashboardPathForRole(demoRole));
    },
    [router]
  );

  const logout = useCallback(async (): Promise<void> => {
    setDemoMode(false);
    clearStoredRole();
    setIsDemo(false);
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // ignore sign-out errors (e.g. already signed out)
    }
    setUser(null);
    setProfile(null);
    setRole(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      loading,
      isDemo,
      signIn,
      signUpStudent,
      demoLogin,
      logout,
    }),
    [user, profile, role, loading, isDemo, signIn, signUpStudent, demoLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
