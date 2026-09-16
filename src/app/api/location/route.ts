import { NextRequest, NextResponse } from "next/server";
import { saveLocationUpdate } from "@/lib/locationService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { busId, latitude, longitude, speed, currentStopIndex, nextStopIndex } = body;

    if (!busId || latitude == null || longitude == null) {
      return NextResponse.json({ error: "busId, latitude, longitude are required" }, { status: 400 });
    }

    await saveLocationUpdate({
      busId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed || 0),
      timestamp: Date.now(),
      currentStopIndex: Number(currentStopIndex || 0),
      nextStopIndex: Number(nextStopIndex || 1),
      sequence: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
