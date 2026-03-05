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

export async function updateCaptureSchedule(
  deviceId: string,
  schedule: {
    capture_schedule_type: number;
    capture_schedule_value: number;
    capture_window_start: number;
    capture_window_end: number;
  }
) {
  const supabase = await createClient();

  // Get the current effective config version (GREATEST of device + global)
  // so we can bump PAST it — otherwise the device won't detect a change
  const { data: effectiveConfig } = await supabase.rpc("get_device_config", {
    p_device_id: deviceId,
  });
  const effectiveVersion = effectiveConfig?.[0]?.config_version ?? 0;
  const newVersion = effectiveVersion + 1;

  const { data: existing } = await supabase
    .from("device_configs")
    .select("id")
    .eq("device_id", deviceId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("device_configs")
      .update({
        ...schedule,
        config_version: newVersion,
      })
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("device_configs").insert({
      device_id: deviceId,
      ...schedule,
      config_version: newVersion,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/devices/${encodeURIComponent(deviceId)}`);
  return { success: true };
}

export async function deleteCameraImage(imageId: string) {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("camera_images")
    .select("storage_path, device_id")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { success: false, error: fetchError?.message ?? "Image not found" };
  }

  // Delete from Storage (continue even if this fails)
  await supabase.storage.from("camera-images").remove([image.storage_path]);

  // Delete DB record
  const { error: dbError } = await supabase
    .from("camera_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  revalidatePath(`/devices/${encodeURIComponent(image.device_id)}`);
  return { success: true };
}

export async function updateImageTransform(
  deviceId: string,
  transform: { image_rotation: number; image_mirror: boolean }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("devices")
    .update(transform)
    .eq("device_id", deviceId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/devices/${encodeURIComponent(deviceId)}`);
  return { success: true };
}

export async function triggerCaptureNow(deviceId: string) {
  const supabase = await createClient();

  // Get effective version (GREATEST of device + global) so we bump past it
  const { data: effectiveConfig } = await supabase.rpc("get_device_config", {
    p_device_id: deviceId,
  });
  const effectiveVersion = effectiveConfig?.[0]?.config_version ?? 0;
  const newVersion = effectiveVersion + 1;

  const { data: existing } = await supabase
    .from("device_configs")
    .select("id")
    .eq("device_id", deviceId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("device_configs")
      .update({
        capture_now: true,
        config_version: newVersion,
      })
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("device_configs").insert({
      device_id: deviceId,
      capture_now: true,
      config_version: newVersion,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/devices/${encodeURIComponent(deviceId)}`);
  return { success: true };
}
