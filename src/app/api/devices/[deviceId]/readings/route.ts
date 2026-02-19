import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SensorReading } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "24", 10);

    // Limit to reasonable range (max 30 days = 720 hours)
    const clampedHours = Math.min(Math.max(hours, 1), 720);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const since = Math.floor(Date.now() / 1000 - clampedHours * 3600);
    const decodedDeviceId = decodeURIComponent(deviceId);

    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("device_id", decodedDeviceId)
      .gte("timestamp", since)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching readings:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch readings",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data as SensorReading[]);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 }
    );
  }
}
