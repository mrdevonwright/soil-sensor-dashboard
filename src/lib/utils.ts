import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "offline":
      return "bg-gray-400";
    case "updating":
      return "bg-blue-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

/**
 * Derive effective device status from last_seen_at timestamp.
 * - <1hr ago: online (green)
 * - 1-3hrs ago: offline (gray)
 * - >3hrs or never: error/unreachable (red)
 */
export function getEffectiveStatus(lastSeenAt: string | null): "online" | "offline" | "error" {
  if (!lastSeenAt) return "error";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return "online";
  if (diffHours < 3) return "offline";
  return "error";
}

export function getRssiQuality(rssi: number | null) {
  if (rssi === null) return "Unknown";
  if (rssi >= -50) return "Excellent";
  if (rssi >= -60) return "Good";
  if (rssi >= -70) return "Fair";
  return "Poor";
}

export function getMeshRoleInfo(role: string | null) {
  switch (role) {
    case "gateway":
      return { label: "Gateway", color: "bg-emerald-100 text-emerald-800", icon: "wifi" };
    case "relay":
      return { label: "Relay", color: "bg-amber-100 text-amber-800", icon: "repeat" };
    case "direct":
      return { label: "Direct", color: "bg-blue-100 text-blue-800", icon: "wifi" };
    default:
      return { label: "Unknown", color: "bg-gray-100 text-gray-600", icon: "help" };
  }
}

export function getDeviceTypeInfo(type: string) {
  switch (type) {
    case "camera":
      return { label: "Camera", color: "bg-purple-100 text-purple-800" };
    case "soil_sensor":
    default:
      return { label: "Soil Sensor", color: "bg-cyan-100 text-cyan-800" };
  }
}

export function getCameraImageUrl(storagePath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/camera-images/${storagePath}`;
}
