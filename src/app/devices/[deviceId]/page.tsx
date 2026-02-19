import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, getStatusColor, getRssiQuality } from "@/lib/utils";
import type { Device, SensorReading } from "@/lib/types";
import { DepthProfileChart } from "@/components/charts/DepthProfileChart";
import { TimeSeriesSection } from "@/components/charts/TimeSeriesSection";

interface Props {
  params: Promise<{ deviceId: string }>;
}

async function getDevice(deviceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("device_id", decodeURIComponent(deviceId))
    .single();

  if (error) {
    console.error("Error fetching device:", error);
    return null;
  }
  return data as Device;
}

async function getLatestReading(deviceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("device_id", decodeURIComponent(deviceId))
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }
  return data as SensorReading;
}

async function getReadingHistory(deviceId: string, hours: number = 24) {
  const supabase = await createClient();
  const since = Date.now() / 1000 - hours * 3600;

  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("device_id", decodeURIComponent(deviceId))
    .gte("timestamp", since)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }
  return data as SensorReading[];
}

export default async function DeviceDetailPage({ params }: Props) {
  const { deviceId } = await params;
  const [device, latestReading, history] = await Promise.all([
    getDevice(deviceId),
    getLatestReading(deviceId),
    getReadingHistory(deviceId),
  ]);

  if (!device) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700"
              >
                &larr; Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {device.device_name || device.device_id}
              </h1>
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Device Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Last Seen</h3>
            <p className="text-xl font-semibold text-gray-900">
              {device.last_seen_at
                ? formatRelativeTime(device.last_seen_at)
                : "Never"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Firmware</h3>
            <p className="text-xl font-semibold text-gray-900">
              {device.firmware_version || "Unknown"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">WiFi Signal</h3>
            <p className="text-xl font-semibold text-gray-900">
              {device.wifi_rssi ? `${device.wifi_rssi} dBm` : "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {getRssiQuality(device.wifi_rssi)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="text-xl font-semibold text-gray-900">
              {device.successful_uploads + device.failed_uploads > 0
                ? `${(
                    (device.successful_uploads /
                      (device.successful_uploads + device.failed_uploads)) *
                    100
                  ).toFixed(1)}%`
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {device.successful_uploads} / {device.successful_uploads + device.failed_uploads} uploads
            </p>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Farm ID:</span>
              <p className="font-medium">{device.farm_id || "Not set"}</p>
            </div>
            <div>
              <span className="text-gray-500">Block ID:</span>
              <p className="font-medium">{device.block_id || "Not set"}</p>
            </div>
            <div>
              <span className="text-gray-500">Sub-Block ID:</span>
              <p className="font-medium">{device.sub_block_id || "Not set"}</p>
            </div>
            <div>
              <span className="text-gray-500">Device ID:</span>
              <p className="font-medium font-mono text-xs">{device.device_id}</p>
            </div>
          </div>
        </div>

        {/* Latest Reading */}
        {latestReading ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Latest Reading
            </h2>
            <TimeSeriesSection
              latestReading={latestReading}
              initialHistory={history}
              deviceId={device.device_id}
            />

            {/* Depth Profile Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Moisture by Depth
                </h3>
                <DepthProfileChart
                  data={latestReading.moisture_levels}
                  type="moisture"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Temperature by Depth
                </h3>
                <DepthProfileChart
                  data={latestReading.temperature_levels}
                  type="temperature"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Salinity by Depth
                </h3>
                <DepthProfileChart
                  data={latestReading.salinity_levels}
                  type="salinity"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-center text-gray-500">
            No sensor readings available for this device yet.
          </div>
        )}
      </main>
    </div>
  );
}
