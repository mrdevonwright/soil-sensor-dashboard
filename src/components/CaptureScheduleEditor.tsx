"use client";

import { useState, useTransition } from "react";
import { updateCaptureSchedule } from "@/app/devices/[deviceId]/actions";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  deviceId: string;
  initialScheduleType: number;
  initialScheduleValue: number;
  initialWindowStart: number;
  initialWindowEnd: number;
}

function formatSchedule(type: number, value: number): string {
  switch (type) {
    case 0: return "Manual only";
    case 1: return "Every wake cycle";
    case 2: return `Every ${value} min`;
    case 3: {
      const days = DAYS_OF_WEEK.filter((_, i) => (value >> i) & 1);
      return days.length > 0 ? days.join(", ") : "No days selected";
    }
    case 4: return value === 32 ? "Last day of month" : `Day ${value}`;
    default: return "Unknown";
  }
}

export function CaptureScheduleEditor({
  deviceId,
  initialScheduleType,
  initialScheduleValue,
  initialWindowStart,
  initialWindowEnd,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [schedType, setSchedType] = useState(initialScheduleType);
  const [schedValue, setSchedValue] = useState(initialScheduleValue);
  const [winStart, setWinStart] = useState(initialWindowStart);
  const [winEnd, setWinEnd] = useState(initialWindowEnd);

  const handleTypeChange = (newType: number) => {
    setSchedType(newType);
    switch (newType) {
      case 0: case 1: setSchedValue(0); break;
      case 2: setSchedValue(60); break;
      case 3: setSchedValue(62); break; // Mon-Fri
      case 4: setSchedValue(1); break;
    }
  };

  const toggleWeekday = (dayIndex: number) => {
    setSchedValue((v) => v ^ (1 << dayIndex));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCaptureSchedule(deviceId, {
        capture_schedule_type: schedType,
        capture_schedule_value: schedValue,
        capture_window_start: winStart,
        capture_window_end: winEnd,
      });
      if (result.success) {
        toast.success("Capture schedule updated", {
          description: "Camera will apply on next wake cycle.",
        });
        setIsEditing(false);
      } else {
        toast.error("Failed to update schedule", { description: result.error });
      }
    });
  };

  const handleCancel = () => {
    setSchedType(initialScheduleType);
    setSchedValue(initialScheduleValue);
    setWinStart(initialWindowStart);
    setWinEnd(initialWindowEnd);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-500">Schedule:</span>{" "}
          <span className="font-medium">{formatSchedule(initialScheduleType, initialScheduleValue)}</span>
          {initialScheduleType !== 0 && initialWindowEnd < 24 && (
            <span className="text-gray-500 ml-2">
              ({initialWindowStart.toString().padStart(2, "0")}:00-{initialWindowEnd.toString().padStart(2, "0")}:00)
            </span>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      {/* Schedule Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select
            value={schedType}
            onChange={(e) => handleTypeChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value={0}>Manual Only</option>
            <option value={1}>Every Wake Cycle</option>
            <option value={2}>Every N Minutes</option>
            <option value={3}>Weekly</option>
            <option value={4}>Monthly</option>
          </select>
        </div>

        {schedType === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interval (min)</label>
            <input
              type="number"
              value={schedValue}
              onChange={(e) => setSchedValue(parseInt(e.target.value) || 0)}
              min={1}
              max={1440}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        )}

        {schedType === 4 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
            <select
              value={schedValue}
              onChange={(e) => setSchedValue(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Day {i + 1}</option>
              ))}
              <option value={32}>Last day of month</option>
            </select>
          </div>
        )}
      </div>

      {/* Weekly day picker */}
      {schedType === 3 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map((day, i) => {
              const isActive = (schedValue >> i) & 1;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(i)}
                  className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
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

      {/* Time window (non-manual modes) */}
      {schedType !== 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Window Start</label>
            <select
              value={winStart}
              onChange={(e) => setWinStart(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Window End</label>
            <select
              value={winEnd}
              onChange={(e) => setWinEnd(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
              ))}
              <option value={24}>All day</option>
            </select>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : "Save Schedule"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
