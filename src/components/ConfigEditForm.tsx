"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import { updateConfig, type UpdateConfigInput } from "@/app/config/actions";
import type { DeviceConfig } from "@/lib/types";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const configSchema = z.object({
  collection_interval_min: z.number().min(1).max(1440),
  deep_sleep_enabled: z.boolean(),
  ntp_sync_interval_hours: z.number().min(1).max(168),
  max_consecutive_failures: z.number().min(1).max(100),
  extended_sleep_minutes: z.number().min(1).max(1440),
  sensor_address: z.string().length(1),
  test_mode_enabled: z.boolean(),
  debug_logging_enabled: z.boolean(),
  capture_schedule_type: z.number().min(0).max(4),
  capture_schedule_value: z.number().min(0).max(1440),
  capture_window_start: z.number().min(0).max(23),
  capture_window_end: z.number().min(0).max(24),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface ConfigEditFormProps {
  config: DeviceConfig;
  isGlobal?: boolean;
}

function formatSchedule(type: number, value: number): string {
  switch (type) {
    case 0: return "Manual only";
    case 1: return "Every wake cycle";
    case 2: return `Every ${value} min`;
    case 3: {
      const days = DAYS_OF_WEEK.filter((_, i) => (value >> i) & 1);
      return days.length > 0 ? `Weekly: ${days.join(", ")}` : "Weekly (no days)";
    }
    case 4: return value === 32 ? "Monthly: Last day" : `Monthly: Day ${value}`;
    default: return "Unknown";
  }
}

export function ConfigEditForm({ config, isGlobal = false }: ConfigEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      capture_schedule_type: config.capture_schedule_type ?? 0,
      capture_schedule_value: config.capture_schedule_value ?? 0,
      capture_window_start: config.capture_window_start ?? 0,
      capture_window_end: config.capture_window_end ?? 24,
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
          <ConfigValue label="Capture Schedule" value={formatSchedule(config.capture_schedule_type, config.capture_schedule_value)} />
          <ConfigValue label="Capture Window" value={config.capture_window_end === 24 ? "All day" : `${config.capture_window_start}:00-${config.capture_window_end}:00`} />
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
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

      {/* Camera Capture Schedule */}
      <CameraCaptureSection setValue={setValue} watch={watch} />

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

function CameraCaptureSection({
  setValue,
  watch,
}: {
  setValue: ReturnType<typeof useForm<ConfigFormData>>["setValue"];
  watch: ReturnType<typeof useForm<ConfigFormData>>["watch"];
}) {
  const schedType = watch("capture_schedule_type");
  const schedValue = watch("capture_schedule_value");
  const windowStart = watch("capture_window_start");
  const windowEnd = watch("capture_window_end");
  const isManualOnly = schedType === 0;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = parseInt(e.target.value);
    setValue("capture_schedule_type", newType, { shouldDirty: true });
    // Set sensible defaults for each type
    switch (newType) {
      case 0: // manual
      case 1: // every wake
        setValue("capture_schedule_value", 0, { shouldDirty: true });
        break;
      case 2: // interval
        setValue("capture_schedule_value", 60, { shouldDirty: true });
        break;
      case 3: // weekly — default to Mon-Fri (0b0111110 = 62)
        setValue("capture_schedule_value", 62, { shouldDirty: true });
        break;
      case 4: // monthly — default to 1st
        setValue("capture_schedule_value", 1, { shouldDirty: true });
        break;
    }
  };

  const toggleWeekday = (dayIndex: number) => {
    const newValue = schedValue ^ (1 << dayIndex);
    setValue("capture_schedule_value", newValue, { shouldDirty: true });
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Camera Capture Schedule</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Capture Mode
            </label>
            <select
              value={schedType}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Manual Only</option>
              <option value={1}>Every Wake Cycle</option>
              <option value={2}>Every N Minutes</option>
              <option value={3}>Weekly</option>
              <option value={4}>Monthly</option>
            </select>
          </div>

          {/* Interval input (type 2 only) */}
          {schedType === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Interval (minutes)
              </label>
              <input
                type="number"
                value={schedValue}
                onChange={(e) => setValue("capture_schedule_value", parseInt(e.target.value) || 0, { shouldDirty: true })}
                min={1}
                max={1440}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Monthly day picker (type 4 only) */}
          {schedType === 4 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Day of Month
              </label>
              <select
                value={schedValue}
                onChange={(e) => setValue("capture_schedule_value", parseInt(e.target.value), { shouldDirty: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                ))}
                <option value={32}>Last day of month</option>
              </select>
            </div>
          )}

          {/* Time window (all non-manual modes) */}
          {!isManualOnly && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Window Start (hour)
                </label>
                <select
                  value={windowStart}
                  onChange={(e) => setValue("capture_window_start", parseInt(e.target.value), { shouldDirty: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Window End (hour)
                </label>
                <select
                  value={windowEnd}
                  onChange={(e) => setValue("capture_window_end", parseInt(e.target.value), { shouldDirty: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                  ))}
                  <option value={24}>All day (no restriction)</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Weekly day picker (type 3) */}
        {schedType === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days
            </label>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day, i) => {
                const isActive = (schedValue >> i) & 1;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(i)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {day.charAt(0)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {DAYS_OF_WEEK.filter((_, i) => (schedValue >> i) & 1).join(", ") || "No days selected"}
            </p>
          </div>
        )}

        {/* Helper text */}
        {isManualOnly && (
          <p className="text-sm text-gray-500">
            Camera will only capture when you click &quot;Capture on Next Wake&quot; on the device page.
          </p>
        )}
        {schedType === 3 && (
          <p className="text-sm text-gray-500">
            Camera captures once on each selected day (within the time window if set).
          </p>
        )}
        {schedType === 4 && (
          <p className="text-sm text-gray-500">
            Camera captures once on the selected day of each month (within the time window if set).
          </p>
        )}
      </div>
    </div>
  );
}

function ConfigValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-700 font-medium">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
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
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </label>
  );
}
