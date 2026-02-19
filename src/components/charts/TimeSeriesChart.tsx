"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import type { SensorReading } from "@/lib/types";
import { DEPTH_LABELS } from "@/lib/types";

interface TimeSeriesChartProps {
  data: SensorReading[];
  metric: "moisture" | "temperature" | "salinity";
  selectedLevels: number[];
}

const METRIC_CONFIG = {
  moisture: {
    levelsKey: "moisture_levels" as const,
    label: "Moisture",
    unit: "%",
    baseColor: "#2563eb",
  },
  temperature: {
    levelsKey: "temperature_levels" as const,
    label: "Temperature",
    unit: "°C",
    baseColor: "#ea580c",
  },
  salinity: {
    levelsKey: "salinity_levels" as const,
    label: "Salinity",
    unit: " dS/m",
    baseColor: "#16a34a",
  },
};

// Generate distinct colors for each level
const LEVEL_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
  "#06b6d4", // cyan-500
  "#a855f7", // purple-500
];

export function TimeSeriesChart({ data, metric, selectedLevels }: TimeSeriesChartProps) {
  const config = METRIC_CONFIG[metric];

  // Transform data to include each selected level and the average
  const chartData = data.map((reading) => {
    const levels = reading[config.levelsKey] || [];
    const point: Record<string, number> = {
      timestamp: reading.timestamp * 1000,
    };

    // Add each selected level
    selectedLevels.forEach((levelIndex) => {
      point[`level_${levelIndex}`] = levels[levelIndex] ?? 0;
    });

    // Calculate average of selected levels
    if (selectedLevels.length > 0) {
      const sum = selectedLevels.reduce((acc, idx) => acc + (levels[idx] ?? 0), 0);
      point.average = sum / selectedLevels.length;
    }

    return point;
  });

  const formatXAxis = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, HH:mm");
  };

  const formatTooltipTime = (label: unknown) => {
    if (typeof label === "number") {
      return format(new Date(label), "MMM d, yyyy HH:mm");
    }
    return String(label);
  };

  const formatValue = (value: number) => {
    if (metric === "salinity") {
      return value.toFixed(3);
    }
    return value.toFixed(1);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for this time range
      </div>
    );
  }

  if (selectedLevels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select at least one depth level to view data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          stroke="#6b7280"
          fontSize={12}
          tickMargin={8}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => formatValue(value)}
          unit={config.unit}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelFormatter={formatTooltipTime}
          formatter={(value: unknown, name: unknown) => {
            const numValue = typeof value === "number" ? value : 0;
            const strName = typeof name === "string" ? name : "";
            const displayName = strName === "average"
              ? "Average"
              : DEPTH_LABELS[parseInt(strName.replace("level_", ""))] || strName;
            return [`${formatValue(numValue)}${config.unit}`, displayName];
          }}
        />
        <Legend
          formatter={(value: string) => {
            if (value === "average") return "Average";
            const levelIndex = parseInt(value.replace("level_", ""));
            return DEPTH_LABELS[levelIndex] || value;
          }}
        />

        {/* Lines for each selected level */}
        {selectedLevels.map((levelIndex) => (
          <Line
            key={`level_${levelIndex}`}
            type="monotone"
            dataKey={`level_${levelIndex}`}
            stroke={LEVEL_COLORS[levelIndex % LEVEL_COLORS.length]}
            strokeWidth={1.5}
            dot={false}
            name={`level_${levelIndex}`}
          />
        ))}

        {/* Average line - thicker and dashed */}
        <Line
          type="monotone"
          dataKey="average"
          stroke="#1f2937"
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={false}
          name="average"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
