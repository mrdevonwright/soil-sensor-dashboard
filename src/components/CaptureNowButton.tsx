"use client";

import { useTransition } from "react";
import { triggerCaptureNow } from "@/app/devices/[deviceId]/actions";
import { toast } from "sonner";

export function CaptureNowButton({ deviceId }: { deviceId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await triggerCaptureNow(deviceId);
      if (result.success) {
        toast.success("Capture requested", {
          description: "Camera will capture on its next wake cycle.",
        });
      } else {
        toast.error("Failed to request capture", {
          description: result.error,
        });
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Requesting..." : "Capture on Next Wake"}
    </button>
  );
}
