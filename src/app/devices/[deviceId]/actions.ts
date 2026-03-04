"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDeviceType(
  deviceId: string,
  deviceType: "soil_sensor" | "camera"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("devices")
    .update({ device_type: deviceType })
    .eq("device_id", deviceId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/devices/${encodeURIComponent(deviceId)}`);
  revalidatePath("/");
  return { success: true };
}

export async function triggerCaptureNow(deviceId: string) {
  const supabase = await createClient();

  // Check for existing device-specific config row
  const { data: existing } = await supabase
    .from("device_configs")
    .select("id, config_version")
    .eq("device_id", deviceId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("device_configs")
      .update({
        capture_now: true,
        config_version: existing.config_version + 1,
      })
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    // Create device-specific config row with capture_now
    const { error } = await supabase.from("device_configs").insert({
      device_id: deviceId,
      capture_now: true,
      config_version: 1,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/devices/${encodeURIComponent(deviceId)}`);
  return { success: true };
}
