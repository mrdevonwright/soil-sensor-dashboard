"use client";

export type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TIME_RANGES: { value: TimeRange; label: string; hours: number }[] = [
  { value: "1h", label: "1H", hours: 1 },
  { value: "6h", label: "6H", hours: 6 },
  { value: "24h", label: "24H", hours: 24 },
  { value: "7d", label: "7D", hours: 168 },
  { value: "30d", label: "30D", hours: 720 },
];

export function getHoursForRange(range: TimeRange): number {
  const found = TIME_RANGES.find((r) => r.value === range);
  return found?.hours ?? 24;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            value === range.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
