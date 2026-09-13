"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { isDemoMode, setDemoMode } from "@/lib/geolocation";
import { getFirebaseAuth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isDemoMode()) {
      router.push("/student");
      return;
    }
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) {
        router.push("/student");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      localStorage.setItem("busalert_user_role", role);
      router.push(`/${role}`);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: string) => {
    setLoading(true);
    setError(null);

    try {
      setDemoMode(true);
      localStorage.setItem("busalert_user_role", demoRole);
      router.push(`/${demoRole}`);
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">BUSALERT</h2>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-gray-900"
            >
              <option value="student">Student</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-white rounded-md font-medium hover:bg-secondary transition-colors">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">or try demo</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => handleDemoLogin("student")}
              disabled={loading}
              className="py-2 px-3 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Student
            </button>
            <button
              onClick={() => handleDemoLogin("driver")}
              disabled={loading}
              className="py-2 px-3 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Driver
            </button>
            <button
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
              className="py-2 px-3 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Admin
            </button>
          </div>
        </div>
        
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}