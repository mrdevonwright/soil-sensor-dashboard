"use client";

export type MetricType = "moisture" | "temperature" | "salinity";

interface SensorMetricPanelProps {
  type: MetricType;
  value: number;
  selected: boolean;
  onClick: () => void;
}

const PANEL_CONFIG = {
  moisture: {
    label: "Avg Moisture",
    unit: "%",
    bgColor: "bg-blue-50",
    bgColorSelected: "bg-blue-100 ring-2 ring-blue-500",
    textColor: "text-blue-600",
    valueColor: "text-blue-700",
    format: (v: number) => v.toFixed(1),
  },
  temperature: {
    label: "Avg Temperature",
    unit: "°C",
    bgColor: "bg-orange-50",
    bgColorSelected: "bg-orange-100 ring-2 ring-orange-500",
    textColor: "text-orange-600",
    valueColor: "text-orange-700",
    format: (v: number) => v.toFixed(1),
  },
  salinity: {
    label: "Avg Salinity",
    unit: " dS/m",
    bgColor: "bg-green-50",
    bgColorSelected: "bg-green-100 ring-2 ring-green-500",
    textColor: "text-green-600",
    valueColor: "text-green-700",
    format: (v: number) => v.toFixed(3),
  },
};

export function SensorMetricPanel({
  type,
  value,
  selected,
  onClick,
}: SensorMetricPanelProps) {
  const config = PANEL_CONFIG[type];

  return (
    <button
      onClick={onClick}
      className={`text-center p-4 rounded-lg cursor-pointer transition-all ${
        selected ? config.bgColorSelected : config.bgColor
      } hover:scale-[1.02] active:scale-[0.98]`}
    >
      <p className={`text-sm ${config.textColor}`}>{config.label}</p>
      <p className={`text-2xl font-bold ${config.valueColor}`}>
        {config.format(value)}
        {config.unit}
      </p>
      <p className={`text-xs mt-1 ${config.textColor} opacity-70`}>
        {selected ? "Click to close" : "Click to view history"}
      </p>
    </button>
  );
}
