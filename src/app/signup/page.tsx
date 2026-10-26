"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DEMO_ROUTES } from "@/lib/demoData";
import { isDemoMode } from "@/lib/geolocation";
import { dashboardPathForRole, getStoredRole } from "@/lib/userService";
import type { StudentRoute } from "@/types";

const BRANCHES = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "AI & Machine Learning",
  "Other",
];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  branch: string;
  rollNo: string;
  routeId: string;
  boardingStopId: string;
  destinationStopId: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  mobile: "",
  branch: "",
  rollNo: "",
  routeId: "",
  boardingStopId: "",
  destinationStopId: "",
};

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 transition-colors ${
    hasError ? "border-red-400" : "border-gray-300"
  }`;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Name is required";
  else if (form.name.trim().length < 3) errors.name = "Enter your full name";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email address";

  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 6) errors.password = "At least 6 characters";

  if (!form.confirmPassword) errors.confirmPassword = "Confirm your password";
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  const mobileDigits = form.mobile.replace(/\D/g, "");
  if (!mobileDigits) errors.mobile = "Mobile number is required";
  else if (mobileDigits.length !== 10)
    errors.mobile = "Enter a valid 10-digit mobile number";

  if (!form.branch) errors.branch = "Select your branch";
  if (!form.routeId) errors.routeId = "Select your bus route";
  if (!form.boardingStopId) errors.boardingStopId = "Select your boarding stop";

  return errors;
}

export default function SignupPage() {
  const { user, role, loading, signUpStudent } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isDemoMode()) {
      router.replace(dashboardPathForRole(getStoredRole() ?? "student"));
      return;
    }
    if (user && role) {
      router.replace(dashboardPathForRole(role));
    }
  }, [loading, user, role, router]);

  const selectedRoute = useMemo(
    () => DEMO_ROUTES.find((r) => r.routeId === form.routeId),
    [form.routeId]
  );

  const routeStops = selectedRoute?.stops ?? [];

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "routeId") {
        next.boardingStopId = "";
        next.destinationStopId = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = document.querySelector<HTMLElement>("[data-invalid='true']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const route = DEMO_ROUTES.find((r) => r.routeId === form.routeId)!;
    const boardingStop = route.stops.find((s) => s.stopId === form.boardingStopId)!;
    const destinationStop = route.stops.find(
      (s) => s.stopId === form.destinationStopId
    );

    setSubmitting(true);
    try {
      await signUpStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        mobile: form.mobile.replace(/\D/g, ""),
        branch: form.branch,
        rollNo: form.rollNo.trim() || undefined,
        routeId: route.routeId,
        routeName: route.name,
        boardingStopId: boardingStop.stopId,
        boardingStopName: boardingStop.name,
        destinationStopId: destinationStop?.stopId,
        destinationStopName: destinationStop?.name,
      });

      const seedRoute: StudentRoute = {
        originStopId: boardingStop.stopId,
        destinationStopId: destinationStop?.stopId ?? boardingStop.stopId,
        originName: boardingStop.name,
        destinationName: destinationStop?.name ?? boardingStop.name,
        originLat: boardingStop.latitude,
        originLng: boardingStop.longitude,
        destinationLat: destinationStop?.latitude ?? boardingStop.latitude,
        destinationLng: destinationStop?.longitude ?? boardingStop.longitude,
      };
      localStorage.setItem("busalert_student_route", JSON.stringify(seedRoute));

      router.push("/student");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  const boardingIdx = routeStops.findIndex((s) => s.stopId === form.boardingStopId);
  const destinationOptions =
    boardingIdx === -1
      ? routeStops
      : routeStops.filter((_, idx) => idx !== boardingIdx);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg w-full mx-auto bg-white rounded-2xl shadow-lg p-8 anim-pop">
        <h2 className="text-3xl font-extrabold mb-1 text-center text-gray-900 tracking-tight">
          BUSALERT
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Student registration — set up your bus pass in a minute
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="space-y-4 anim-up">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Personal Details
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                type="text"
                placeholder="e.g. Rahul Sharma"
                data-invalid={!!errors.name}
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 anim-shake">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Branch</label>
                <select
                  value={form.branch}
                  onChange={(e) => update("branch", e.target.value)}
                  data-invalid={!!errors.branch}
                  className={inputClass(!!errors.branch)}
                >
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="text-xs text-red-500 mt-1 anim-shake">{errors.branch}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Roll No <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={form.rollNo}
                  onChange={(e) => update("rollNo", e.target.value)}
                  type="text"
                  placeholder="e.g. 21CS1042"
                  className={inputClass(false)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Mobile Number</label>
              <input
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                data-invalid={!!errors.mobile}
                className={inputClass(!!errors.mobile)}
              />
              {errors.mobile && <p className="text-xs text-red-500 mt-1 anim-shake">{errors.mobile}</p>}
            </div>
          </section>

          <hr className="border-gray-200" />

          <section className="space-y-4 anim-up anim-d1">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Bus Route Details
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Route</label>
              <select
                value={form.routeId}
                onChange={(e) => update("routeId", e.target.value)}
                data-invalid={!!errors.routeId}
                className={inputClass(!!errors.routeId)}
              >
                <option value="">Select route</option>
                {DEMO_ROUTES.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.routeId && <p className="text-xs text-red-500 mt-1 anim-shake">{errors.routeId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Boarding Stop</label>
              <select
                value={form.boardingStopId}
                onChange={(e) => update("boardingStopId", e.target.value)}
                disabled={!selectedRoute}
                data-invalid={!!errors.boardingStopId}
                className={inputClass(!!errors.boardingStopId)}
              >
                <option value="">
                  {selectedRoute ? "Select boarding stop" : "Select a route first"}
                </option>
                {routeStops.map((s) => (
                  <option key={s.stopId} value={s.stopId}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.boardingStopId && (
                <p className="text-xs text-red-500 mt-1 anim-shake">{errors.boardingStopId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">
                Drop-off Stop <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={form.destinationStopId}
                onChange={(e) => update("destinationStopId", e.target.value)}
                disabled={!form.boardingStopId}
                className={inputClass(false)}
              >
                <option value="">
                  {form.boardingStopId ? "Select drop-off stop" : "Select boarding stop first"}
                </option>
                {destinationOptions.map((s) => (
                  <option key={s.stopId} value={s.stopId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <hr className="border-gray-200" />

          <section className="space-y-4 anim-up anim-d2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Account Security
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Email</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                data-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 anim-shake">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Password</label>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min 6 characters"
                    data-invalid={!!errors.password}
                    className={inputClass(!!errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 anim-shake">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Confirm Password</label>
                <input
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  data-invalid={!!errors.confirmPassword}
                  className={inputClass(!!errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 anim-shake">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </section>

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg anim-shake">
              <p className="text-red-700 text-sm font-medium">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? "Creating account..." : "Create Student Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
