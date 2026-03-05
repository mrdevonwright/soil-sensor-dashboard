"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function parseVersionFromFilename(filename: string): { version: string; deviceType: string } | null {
  // Match patterns like "camera-v1.2.1.bin" or "soil_sensor-v1.1.2.bin"
  const match = filename.match(/^(camera|soil_sensor)-v(\d+\.\d+\.\d+)\.bin$/);
  if (match) return { deviceType: match[1], version: match[2] };
  // Also try just "vX.Y.Z.bin"
  const vMatch = filename.match(/v(\d+\.\d+\.\d+)\.bin$/);
  if (vMatch) return { version: vMatch[1], deviceType: "" };
  return null;
}

function computeVersionCode(version: string): number | null {
  const parts = version.split(".");
  if (parts.length !== 3 || parts.some((p) => isNaN(Number(p)))) return null;
  const [major, minor, patch] = parts.map(Number);
  return major * 10000 + minor * 100 + patch;
}

export function FirmwareUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [deviceType, setDeviceType] = useState<"soil_sensor" | "camera">("camera");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const versionCode = computeVersionCode(version);
  const isValid = file && version && versionCode !== null;

  function handleFile(f: File) {
    setFile(f);
    const parsed = parseVersionFromFilename(f.name);
    if (parsed) {
      if (parsed.version) setVersion(parsed.version);
      if (parsed.deviceType === "camera" || parsed.deviceType === "soil_sensor") {
        setDeviceType(parsed.deviceType);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);
      formData.append("device_type", deviceType);
      formData.append("release_notes", releaseNotes);
      formData.append("is_mandatory", String(isMandatory));

      const res = await fetch("/api/firmware/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Firmware deployed", {
        description: `v${version} (${deviceType}) is now available for OTA. Devices will pick it up on next wake.`,
      });

      // Reset form
      setFile(null);
      setVersion("");
      setReleaseNotes("");
      setIsMandatory(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      router.refresh();
    } catch (err) {
      toast.error("Deploy failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : file
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".bin"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {file ? (
          <div>
            <p className="font-medium text-green-800">{file.name}</p>
            <p className="text-sm text-green-600">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500">Drop .bin file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Built with: pio run</p>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
          <input
            type="text"
            placeholder="1.2.1"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {version && versionCode !== null && (
            <p className="text-xs text-gray-600 mt-1">Code: {versionCode}</p>
          )}
          {version && versionCode === null && (
            <p className="text-xs text-red-500 mt-1">Format: X.Y.Z</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as "soil_sensor" | "camera")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="camera">Camera</option>
            <option value="soil_sensor">Soil Sensor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Release Notes</label>
          <input
            type="text"
            placeholder="Fix config sync, capture scheduling"
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Options + Submit */}
      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
            className="rounded border-gray-300"
          />
          Mandatory update
        </label>
        <button
          type="submit"
          disabled={!isValid || uploading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "Deploying..." : "Deploy Firmware"}
        </button>
      </div>
    </form>
  );
}
