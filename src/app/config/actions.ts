"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateConfigInput {
  id: string;
  collection_interval_min: number;
  deep_sleep_enabled: boolean;
  ntp_sync_interval_hours: number;
  max_consecutive_failures: number;
  extended_sleep_minutes: number;
  sensor_address: string;
  test_mode_enabled: boolean;
  debug_logging_enabled: boolean;
}

export async function updateConfig(input: UpdateConfigInput) {
  const supabase = await createClient();

  // First, get the current config to get the current version
  const { data: currentConfig, error: fetchError } = await supabase
    .from("device_configs")
    .select("config_version")
    .eq("id", input.id)
    .single();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  // Increment config_version so devices know to sync
  const newVersion = (currentConfig?.config_version ?? 0) + 1;

  const { error } = await supabase
    .from("device_configs")
    .update({
      collection_interval_min: input.collection_interval_min,
      deep_sleep_enabled: input.deep_sleep_enabled,
      ntp_sync_interval_hours: input.ntp_sync_interval_hours,
      max_consecutive_failures: input.max_consecutive_failures,
      extended_sleep_minutes: input.extended_sleep_minutes,
      sensor_address: input.sensor_address,
      test_mode_enabled: input.test_mode_enabled,
      debug_logging_enabled: input.debug_logging_enabled,
      config_version: newVersion,
    })
    .eq("id", input.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/config");
  return { success: true, newVersion };
}

export async function createDeviceConfig(deviceId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("device_configs").insert({
    device_id: deviceId,
    collection_interval_min: 15,
    deep_sleep_enabled: true,
    ntp_sync_interval_hours: 6,
    max_consecutive_failures: 10,
    extended_sleep_minutes: 60,
    sensor_address: "0",
    test_mode_enabled: false,
    debug_logging_enabled: false,
    config_version: 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/config");
  return { success: true };
}

export async function deleteDeviceConfig(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("device_configs")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/config");
  return { success: true };
}
