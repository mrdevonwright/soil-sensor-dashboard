"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import { updateConfig, type UpdateConfigInput } from "@/app/config/actions";
import type { DeviceConfig } from "@/lib/types";
import { toast } from "sonner";

const configSchema = z.object({
  collection_interval_min: z.number().min(1).max(1440),
  deep_sleep_enabled: z.boolean(),
  ntp_sync_interval_hours: z.number().min(1).max(168),
  max_consecutive_failures: z.number().min(1).max(100),
  extended_sleep_minutes: z.number().min(1).max(1440),
  sensor_address: z.string().length(1),
  test_mode_enabled: z.boolean(),
  debug_logging_enabled: z.boolean(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface ConfigEditFormProps {
  config: DeviceConfig;
  isGlobal?: boolean;
}

export function ConfigEditForm({ config, isGlobal = false }: ConfigEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      collection_interval_min: config.collection_interval_min,
      deep_sleep_enabled: config.deep_sleep_enabled,
      ntp_sync_interval_hours: config.ntp_sync_interval_hours,
      max_consecutive_failures: config.max_consecutive_failures,
      extended_sleep_minutes: config.extended_sleep_minutes,
      sensor_address: config.sensor_address,
      test_mode_enabled: config.test_mode_enabled,
      debug_logging_enabled: config.debug_logging_enabled,
    },
  });

  const onSubmit = (data: ConfigFormData) => {
    startTransition(async () => {
      const input: UpdateConfigInput = {
        id: config.id,
        ...data,
      };

      const result = await updateConfig(input);

      if (result.success) {
        toast.success(`Config updated! Version: ${result.newVersion}`, {
          description: "Device will sync on next wake cycle.",
        });
        setIsEditing(false);
      } else {
        toast.error("Failed to update config", {
          description: result.error,
        });
      }
    });
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <ConfigValue label="Collection Interval" value={`${config.collection_interval_min} min`} />
          <ConfigValue label="Deep Sleep" value={config.deep_sleep_enabled ? "Enabled" : "Disabled"} />
          <ConfigValue label="NTP Sync Interval" value={`${config.ntp_sync_interval_hours} hours`} />
          <ConfigValue label="Config Version" value={config.config_version.toString()} />
          <ConfigValue label="Max Failures" value={config.max_consecutive_failures.toString()} />
          <ConfigValue label="Extended Sleep" value={`${config.extended_sleep_minutes} min`} />
          <ConfigValue label="Sensor Address" value={config.sensor_address} />
          <ConfigValue label="Test Mode" value={config.test_mode_enabled ? "On" : "Off"} />
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Configuration
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collection Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Collection Interval (minutes)
          </label>
          <input
            type="number"
            {...register("collection_interval_min", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.collection_interval_min && (
            <p className="text-red-500 text-sm mt-1">{errors.collection_interval_min.message}</p>
          )}
        </div>

        {/* NTP Sync Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NTP Sync Interval (hours)
          </label>
          <input
            type="number"
            {...register("ntp_sync_interval_hours", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.ntp_sync_interval_hours && (
            <p className="text-red-500 text-sm mt-1">{errors.ntp_sync_interval_hours.message}</p>
          )}
        </div>

        {/* Max Consecutive Failures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Consecutive Failures
          </label>
          <input
            type="number"
            {...register("max_consecutive_failures", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.max_consecutive_failures && (
            <p className="text-red-500 text-sm mt-1">{errors.max_consecutive_failures.message}</p>
          )}
        </div>

        {/* Extended Sleep Minutes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extended Sleep (minutes)
          </label>
          <input
            type="number"
            {...register("extended_sleep_minutes", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.extended_sleep_minutes && (
            <p className="text-red-500 text-sm mt-1">{errors.extended_sleep_minutes.message}</p>
          )}
        </div>

        {/* Sensor Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sensor Address
          </label>
          <input
            type="text"
            maxLength={1}
            {...register("sensor_address")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.sensor_address && (
            <p className="text-red-500 text-sm mt-1">{errors.sensor_address.message}</p>
          )}
        </div>
      </div>

      {/* Boolean toggles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ToggleField
          label="Deep Sleep"
          register={register("deep_sleep_enabled")}
        />
        <ToggleField
          label="Test Mode"
          register={register("test_mode_enabled")}
        />
        <ToggleField
          label="Debug Logging"
          register={register("debug_logging_enabled")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save & Push to Devices"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {isDirty && (
        <p className="text-sm text-amber-600">
          You have unsaved changes. Config version will increment when saved.
        </p>
      )}
    </form>
  );
}

function ConfigValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function ToggleField({
  label,
  register,
}: {
  label: string;
  register: ReturnType<typeof useForm>["register"] extends (name: string) => infer R ? R : never;
}) {
  return (
    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        {...register}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
