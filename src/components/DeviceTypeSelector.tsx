"use client";

import { useTransition } from "react";
import { updateDeviceType } from "@/app/devices/[deviceId]/actions";
import { toast } from "sonner";

interface Props {
  deviceId: string;
  currentType: "soil_sensor" | "camera";
}

export function DeviceTypeSelector({ deviceId, currentType }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "soil_sensor" | "camera";
    if (newType === currentType) return;

    startTransition(async () => {
      const result = await updateDeviceType(deviceId, newType);
      if (result.success) {
        toast.success("Device type updated", {
          description: `Changed to ${newType === "camera" ? "Camera" : "Soil Sensor"}.`,
        });
      } else {
        toast.error("Failed to update device type", {
          description: result.error,
        });
      }
    });
  };

  return (
    <select
      value={currentType}
      onChange={handleChange}
      disabled={isPending}
      className="px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer disabled:opacity-50 appearance-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 pr-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23666' d='M0 2l4 4 4-4z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 4px center",
      }}
    >
      <option value="soil_sensor">Soil Sensor</option>
      <option value="camera">Camera</option>
    </select>
  );
}
