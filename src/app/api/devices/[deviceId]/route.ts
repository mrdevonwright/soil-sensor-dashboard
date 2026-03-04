import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const supabase = await createClient();

  // Delete sensor readings
  await supabase
    .from("sensor_readings")
    .delete()
    .eq("device_id", deviceId);

  // Delete camera images metadata
  await supabase
    .from("camera_images")
    .delete()
    .eq("device_id", deviceId);

  // Delete camera image files from storage
  const storagePrefix = deviceId.replace(/:/g, "_");
  const { data: files } = await supabase.storage
    .from("camera-images")
    .list(storagePrefix);
  if (files && files.length > 0) {
    const paths = files.map((f) => `${storagePrefix}/${f.name}`);
    await supabase.storage.from("camera-images").remove(paths);
  }

  // Delete device configs
  await supabase
    .from("device_configs")
    .delete()
    .eq("device_id", deviceId);

  // Delete the device itself
  const { error } = await supabase
    .from("devices")
    .delete()
    .eq("device_id", deviceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
