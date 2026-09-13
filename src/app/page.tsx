"use client";

import Link from "next/link";
import { useState } from "react";
import { isDemoMode } from "@/lib/geolocation";

export default function Home() {
  const [demoActive] = useState(() => isDemoMode());

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">BUSALERT</h1>
          <Link
            href="/login"
            className="px-4 py-2 rounded-md font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">🚌</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Never Miss Your Bus Again
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Real-time bus tracking with live ETAs, smart leave-now alerts,
            and route monitoring for students, drivers, and administrators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg font-bold text-white bg-primary hover:bg-primary-dark transition-colors text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors text-lg"
            >
              Demo Mode
            </Link>
          </div>

          {demoActive && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg p-4 mb-8">
              <p className="font-medium">Demo mode is active</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600 text-sm">
              Track your bus in real-time, get ETA alerts, and know exactly
              when to leave for your stop.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-3">🚗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Drivers</h3>
            <p className="text-gray-600 text-sm">
              Manage your trips, track your route, and keep students
              informed of your location.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Admins</h3>
            <p className="text-gray-600 text-sm">
              Monitor fleet performance, view analytics, and ensure
              on-time operations across all routes.
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl w-full text-center">
          <div>
            <p className="text-3xl font-bold text-primary">4</p>
            <p className="text-sm text-gray-600">Active Buses</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">3</p>
            <p className="text-sm text-gray-600">Routes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">12</p>
            <p className="text-sm text-gray-600">Stops</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">87%</p>
            <p className="text-sm text-gray-600">On Time</p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          BusAlert - Real-Time Bus Tracking System
        </div>
      </footer>
    </div>
  );
}
