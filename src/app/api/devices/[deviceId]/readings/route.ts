import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SensorReading } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  // Limit to reasonable range (max 30 days = 720 hours)
  const clampedHours = Math.min(Math.max(hours, 1), 720);

  const supabase = await createClient();
  const since = Date.now() / 1000 - clampedHours * 3600;

  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("device_id", decodeURIComponent(deviceId))
    .gte("timestamp", since)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching readings:", error);
    return NextResponse.json(
      { error: "Failed to fetch readings" },
      { status: 500 }
    );
  }

  return NextResponse.json(data as SensorReading[]);
}
