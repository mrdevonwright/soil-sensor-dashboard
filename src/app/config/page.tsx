import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { DeviceConfig } from "@/lib/types";

async function getConfigs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("device_configs")
    .select("*")
    .order("device_id", { ascending: true, nullsFirst: true });

  if (error) {
    console.error("Error fetching configs:", error);
    return [];
  }
  return data as DeviceConfig[];
}

export default async function ConfigPage() {
  const configs = await getConfigs();
  const globalConfig = configs.find((c) => c.device_id === null);
  const deviceConfigs = configs.filter((c) => c.device_id !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Configuration
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Devices
              </Link>
              <Link
                href="/firmware"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Firmware
              </Link>
              <Link
                href="/config"
                className="text-blue-600 font-medium"
              >
                Config
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Global Config */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Global Default Configuration
          </h2>
          <p className="text-gray-500 mb-4">
            These settings apply to all devices unless overridden by a device-specific config.
          </p>

          {globalConfig ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Collection Interval</p>
                <p className="text-xl font-semibold">
                  {globalConfig.collection_interval_min} min
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Deep Sleep</p>
                <p className="text-xl font-semibold">
                  {globalConfig.deep_sleep_enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">NTP Sync Interval</p>
                <p className="text-xl font-semibold">
                  {globalConfig.ntp_sync_interval_hours} hours
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Config Version</p>
                <p className="text-xl font-semibold">
                  {globalConfig.config_version}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              No global config found. Run the SQL migration to create one.
            </p>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>To update:</strong> Edit the device_configs table in Supabase where device_id is NULL.
              Increment config_version to push changes to devices.
            </p>
          </div>
        </div>

        {/* Device-Specific Configs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Device-Specific Overrides
            </h2>
          </div>

          {deviceConfigs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No device-specific configurations.</p>
              <p className="text-sm mt-2">
                Add a row to device_configs with a specific device_id to override global settings.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {deviceConfigs.map((config) => (
                <div key={config.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 font-mono">
                        {config.device_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Interval: {config.collection_interval_min} min |
                        Sleep: {config.deep_sleep_enabled ? "On" : "Off"} |
                        Test Mode: {config.test_mode_enabled ? "On" : "Off"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        Version: {config.config_version}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
