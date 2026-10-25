import { NextRequest, NextResponse } from "next/server";
import { getCurrentBusLocation } from "@/lib/locationService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  try {
    const { busId } = await params;
    const location = await getCurrentBusLocation(busId);

    if (!location) {
      return NextResponse.json({ error: "Bus location not found" }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("GET /api/location/[busId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
