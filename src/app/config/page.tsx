import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { DeviceConfig } from "@/lib/types";
import { ConfigEditForm } from "@/components/ConfigEditForm";

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
              <Link
                href="/api-docs"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                API
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Global Config */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Global Default Configuration
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                These settings apply to all devices unless overridden by a device-specific config.
              </p>
            </div>
            {globalConfig && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                v{globalConfig.config_version}
              </span>
            )}
          </div>

          {globalConfig ? (
            <ConfigEditForm config={globalConfig} isGlobal />
          ) : (
            <p className="text-gray-500">
              No global config found. Run the SQL migration to create one.
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How Config Sync Works
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Edit the configuration above and click &quot;Save &amp; Push to Devices&quot;</li>
            <li>Config version increments automatically</li>
            <li>On next wake cycle, device checks its config version against the server</li>
            <li>If server version is higher, device downloads and applies new settings</li>
          </ol>
        </div>

        {/* Device-Specific Configs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Device-Specific Overrides
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Override global settings for specific devices.
            </p>
          </div>

          {deviceConfigs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No device-specific configurations.</p>
              <p className="text-sm mt-2">
                Device-specific configs will appear here when created.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {deviceConfigs.map((config) => (
                <div key={config.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900 font-mono text-lg">
                        {config.device_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Device-specific override
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      v{config.config_version}
                    </span>
                  </div>
                  <ConfigEditForm config={config} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
