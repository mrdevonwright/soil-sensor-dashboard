import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, getStatusColor, getRssiQuality, getMeshRoleInfo } from "@/lib/utils";
import type { Device, SensorReading } from "@/lib/types";

async function getDevices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    console.error("Error fetching devices:", error);
    return [];
  }
  return data as Device[];
}

async function getRecentReadings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching readings:", error);
    return [];
  }
  return data as SensorReading[];
}

export default async function DashboardPage() {
  const [devices, recentReadings] = await Promise.all([
    getDevices(),
    getRecentReadings(),
  ]);

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const gatewayCount = devices.filter((d) => d.mesh_role === "gateway").length;
  const relayCount = devices.filter((d) => d.mesh_role === "relay").length;
  const totalReadings = recentReadings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Soil Sensor Dashboard
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
                className="text-gray-600 hover:text-gray-900 font-medium"
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500">Total Devices</h3>
            <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500">Online</h3>
            <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500">Gateways</h3>
            <p className="text-2xl font-bold text-emerald-600">{gatewayCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500">Relays</h3>
            <p className="text-2xl font-bold text-amber-600">{relayCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500">Recent Readings</h3>
            <p className="text-2xl font-bold text-blue-600">{totalReadings}</p>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Devices</h2>
          </div>

          {devices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No devices registered yet.</p>
              <p className="text-sm mt-2">
                Devices will appear here once they connect to the backend.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {devices.map((device) => (
                <Link
                  key={device.id}
                  href={`/devices/${device.device_id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            device.status
                          )}`}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {device.device_name || device.device_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {device.farm_id} / {device.block_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {device.firmware_version || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {device.last_seen_at
                            ? formatRelativeTime(device.last_seen_at)
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      {device.mesh_role && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getMeshRoleInfo(device.mesh_role).color}`}>
                          {getMeshRoleInfo(device.mesh_role).label}
                          {device.mesh_hop_count !== null && device.mesh_hop_count > 0 && (
                            <span className="ml-1">({device.mesh_hop_count} hop{device.mesh_hop_count > 1 ? "s" : ""})</span>
                          )}
                        </span>
                      )}
                      {device.mesh_role === "relay" && device.mesh_parent_device && (
                        <span className="text-gray-400">
                          via {device.mesh_parent_device.slice(-8)}
                        </span>
                      )}
                      <span>
                        Signal: {device.wifi_rssi ? `${device.wifi_rssi} dBm` : "N/A"}{" "}
                        ({getRssiQuality(device.wifi_rssi)})
                      </span>
                      <span>
                        Success: {device.successful_uploads + device.failed_uploads > 0
                          ? `${(
                              (device.successful_uploads /
                                (device.successful_uploads +
                                  device.failed_uploads)) *
                              100
                            ).toFixed(0)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
