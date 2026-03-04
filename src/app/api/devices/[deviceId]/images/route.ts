import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CameraImage } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 500);
    const hours = searchParams.get("hours")
      ? Math.min(Math.max(parseInt(searchParams.get("hours")!, 10), 1), 8760)
      : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const decodedDeviceId = decodeURIComponent(deviceId);

    let query = supabase
      .from("camera_images")
      .select("*", { count: "exact" })
      .eq("device_id", decodedDeviceId)
      .order("captured_at", { ascending: false })
      .limit(limit);

    if (hours) {
      const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      query = query.gte("captured_at", since);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching images:", error);
      return NextResponse.json(
        { error: "Failed to fetch images", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: data as CameraImage[],
      total: count ?? 0,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 }
    );
  }
}
