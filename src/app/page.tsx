import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, getStatusColor, getRssiQuality, getMeshRoleInfo, getDeviceTypeInfo, getEffectiveStatus } from "@/lib/utils";
import type { Device, SensorReading } from "@/lib/types";
import DeleteDeviceButton from "@/components/DeleteDeviceButton";

export const dynamic = "force-dynamic";

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

function DeviceRow({ device }: { device: Device }) {
  const effectiveStatus = getEffectiveStatus(device.last_seen_at);

  return (
    <Link
      href={`/devices/${device.device_id}`}
      className="block hover:bg-gray-50"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor(effectiveStatus)}`}
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
          <div className="flex items-center gap-3">
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
            <DeleteDeviceButton deviceId={device.device_id} />
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
            <span className="text-gray-500">
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
  );
}

export default async function DashboardPage() {
  const [devices, recentReadings] = await Promise.all([
    getDevices(),
    getRecentReadings(),
  ]);

  const onlineCount = devices.filter((d) => getEffectiveStatus(d.last_seen_at) === "online").length;
  const sensorDevices = devices.filter((d) => d.device_type !== "camera");
  const cameraDevices = devices.filter((d) => d.device_type === "camera");
  const totalReadings = recentReadings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Lumo Bridge Dashboard
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
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Devices</h3>
            <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Online</h3>
            <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Soil Sensors</h3>
            <p className="text-2xl font-bold text-cyan-600">{sensorDevices.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cameras</h3>
            <p className="text-2xl font-bold text-purple-600">{cameraDevices.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Readings</h3>
            <p className="text-2xl font-bold text-blue-600">{totalReadings}</p>
          </div>
        </div>

        {/* Soil Sensors */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Soil Sensors
              <span className="ml-2 text-sm font-normal text-gray-500">({sensorDevices.length})</span>
            </h2>
          </div>

          {sensorDevices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No soil sensors registered yet.
            </div>
          ) : (
            <div className="divide-y">
              {sensorDevices.map((device) => (
                <DeviceRow key={device.id} device={device} />
              ))}
            </div>
          )}
        </div>

        {/* Cameras */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Cameras
              <span className="ml-2 text-sm font-normal text-gray-500">({cameraDevices.length})</span>
            </h2>
          </div>

          {cameraDevices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No cameras registered yet.
            </div>
          ) : (
            <div className="divide-y">
              {cameraDevices.map((device) => (
                <DeviceRow key={device.id} device={device} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
