import { NextResponse } from "next/server";
import { getAllBusLocations } from "@/lib/locationService";

export async function GET() {
  try {
    const locations = await getAllBusLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error("GET /api/locations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
