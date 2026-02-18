// Database types for Supabase tables

export interface Device {
  id: string;
  device_id: string;
  device_name: string | null;
  farm_id: string | null;
  block_id: string | null;
  sub_block_id: string | null;
  firmware_version: string | null;
  target_firmware_version: string | null;
  status: "online" | "offline" | "updating" | "error" | "unknown";
  last_seen_at: string | null;
  last_reading_at: string | null;
  last_config_sync_at: string | null;
  wifi_rssi: number | null;
  battery_voltage: number | null;
  boot_count: number;
  successful_uploads: number;
  failed_uploads: number;
  registered_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  timestamp: number;
  farm_id: string;
  block_id: string;
  sub_block_id: string | null;
  soil_moisture: number;
  soil_temperature: number;
  electrical_conductivity: number;
  num_levels: number;
  moisture_levels: number[];
  salinity_levels: number[];
  temperature_levels: number[];
  firmware_version: string | null;
  wifi_rssi: number | null;
  battery_voltage: number | null;
  created_at: string;
}

export interface FirmwareVersion {
  id: string;
  version: string;
  version_code: number;
  firmware_url: string;
  firmware_size: number;
  firmware_checksum: string;
  release_notes: string | null;
  min_battery_voltage: number | null;
  requires_version: string | null;
  rollout_percentage: number;
  is_stable: boolean;
  is_mandatory: boolean;
  created_at: string;
  released_at: string | null;
}

export interface DeviceConfig {
  id: string;
  device_id: string | null;
  collection_interval_min: number;
  deep_sleep_enabled: boolean;
  ntp_sync_interval_hours: number;
  max_consecutive_failures: number;
  extended_sleep_minutes: number;
  sensor_address: string;
  test_mode_enabled: boolean;
  debug_logging_enabled: boolean;
  config_version: number;
  created_at: string;
  updated_at: string;
}

// Depth labels for 12-level sensor
export const DEPTH_LABELS = [
  "10cm",
  "20cm",
  "30cm",
  "40cm",
  "50cm",
  "60cm",
  "70cm",
  "80cm",
  "90cm",
  "100cm",
  "110cm",
  "120cm",
];
