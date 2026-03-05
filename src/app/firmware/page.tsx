import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import type { FirmwareVersion } from "@/lib/types";
import { FirmwareUploadForm } from "@/components/FirmwareUploadForm";

export const dynamic = "force-dynamic";

async function getFirmwareVersions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("firmware_versions")
    .select("*")
    .order("version_code", { ascending: false });

  if (error) {
    console.error("Error fetching firmware:", error);
    return [];
  }
  return data as FirmwareVersion[];
}

const deviceTypeLabel: Record<string, { label: string; color: string }> = {
  camera: { label: "Camera", color: "bg-purple-100 text-purple-800" },
  soil_sensor: { label: "Soil Sensor", color: "bg-emerald-100 text-emerald-800" },
};

export default async function FirmwarePage() {
  const firmwareVersions = await getFirmwareVersions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Firmware Management
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
                className="text-blue-600 font-medium"
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
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Deploy New Firmware
          </h2>
          <FirmwareUploadForm />
        </div>

        {/* Firmware List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Firmware Versions
            </h2>
          </div>

          {firmwareVersions.length === 0 ? (
            <div className="p-6 text-center text-gray-900">
              <p>No firmware versions uploaded yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {firmwareVersions.map((fw) => {
                const dt = deviceTypeLabel[fw.device_type] ?? deviceTypeLabel.soil_sensor;
                return (
                  <div key={fw.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            v{fw.version}
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${dt.color}`}>
                              {dt.label}
                            </span>
                            {fw.is_stable && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                Stable
                              </span>
                            )}
                            {fw.is_mandatory && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                Mandatory
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-900">
                            Code: {fw.version_code} | Size: {(fw.firmware_size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          Rollout: {fw.rollout_percentage}%
                        </p>
                        <p className="text-sm text-gray-900">
                          {fw.released_at
                            ? `Released ${formatRelativeTime(fw.released_at)}`
                            : "Not released"}
                        </p>
                      </div>
                    </div>
                    {fw.release_notes && (
                      <p className="mt-2 text-sm text-gray-600">{fw.release_notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
