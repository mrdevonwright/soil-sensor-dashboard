"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DEPTH_LABELS } from "@/lib/types";

interface DepthProfileChartProps {
  data: number[];
  type: "moisture" | "temperature" | "salinity";
}

export function DepthProfileChart({ data, type }: DepthProfileChartProps) {
  const chartData = data.map((value, index) => ({
    depth: DEPTH_LABELS[index] || `${(index + 1) * 10}cm`,
    value,
  }));

  const getColor = (value: number) => {
    if (type === "moisture") {
      // Blue gradient for moisture (0-50%)
      const intensity = Math.min(value / 50, 1);
      const lightness = 70 - intensity * 40;
      return `hsl(210, 100%, ${lightness}%)`;
    } else if (type === "temperature") {
      // Red-blue gradient for temperature (10-40°C)
      const normalized = Math.min(Math.max((value - 10) / 30, 0), 1);
      const hue = (1 - normalized) * 240; // 240 (blue) to 0 (red)
      return `hsl(${hue}, 70%, 50%)`;
    } else {
      // Green gradient for salinity (0-5 dS/m)
      const intensity = Math.min(value / 5, 1);
      const lightness = 70 - intensity * 40;
      return `hsl(120, 60%, ${lightness}%)`;
    }
  };

  const getUnit = () => {
    switch (type) {
      case "moisture":
        return "%";
      case "temperature":
        return "°C";
      case "salinity":
        return " dS/m";
    }
  };

  const formatValue = (value: number) => {
    if (type === "salinity") {
      return value.toFixed(3);
    }
    return value.toFixed(1);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" unit={getUnit()} />
        <YAxis type="category" dataKey="depth" width={50} />
        <Tooltip
          formatter={(value) => {
            const numValue = typeof value === "number" ? value : 0;
            return [
              `${formatValue(numValue)}${getUnit()}`,
              type.charAt(0).toUpperCase() + type.slice(1),
            ];
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
