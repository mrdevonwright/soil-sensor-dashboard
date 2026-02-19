"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { SensorReading } from "@/lib/types";

interface TimeSeriesChartProps {
  data: SensorReading[];
  metric: "moisture" | "temperature" | "salinity";
}

const METRIC_CONFIG = {
  moisture: {
    key: "soil_moisture" as const,
    label: "Moisture",
    unit: "%",
    color: "#2563eb", // blue-600
    gradient: ["#3b82f6", "#1d4ed8"], // blue-500 to blue-700
  },
  temperature: {
    key: "soil_temperature" as const,
    label: "Temperature",
    unit: "°C",
    color: "#ea580c", // orange-600
    gradient: ["#f97316", "#c2410c"], // orange-500 to orange-700
  },
  salinity: {
    key: "electrical_conductivity" as const,
    label: "Salinity",
    unit: " dS/m",
    color: "#16a34a", // green-600
    gradient: ["#22c55e", "#15803d"], // green-500 to green-700
  },
};

export function TimeSeriesChart({ data, metric }: TimeSeriesChartProps) {
  const config = METRIC_CONFIG[metric];

  const chartData = data.map((reading) => ({
    timestamp: reading.timestamp * 1000, // Convert to milliseconds
    value: reading[config.key],
  }));

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

  const formatTooltipValue = (value: unknown) => {
    const numValue = typeof value === "number" ? value : 0;
    return [`${formatValue(numValue)}${config.unit}`, config.label];
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for this time range
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.gradient[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={config.gradient[1]} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(value) => `${formatValue(value)}`}
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
          formatter={formatTooltipValue}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={config.color}
          strokeWidth={2}
          fill={`url(#gradient-${metric})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
