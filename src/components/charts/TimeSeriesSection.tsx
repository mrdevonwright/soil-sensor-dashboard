"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import type { SensorReading } from "@/lib/types";
import { SensorMetricPanel, type MetricType } from "./SensorMetricPanel";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { TimeRangeSelector, type TimeRange, getHoursForRange } from "./TimeRangeSelector";

interface TimeSeriesSectionProps {
  latestReading: SensorReading;
  initialHistory: SensorReading[];
  deviceId: string;
}

export function TimeSeriesSection({
  latestReading,
  initialHistory,
  deviceId,
}: TimeSeriesSectionProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [historyData, setHistoryData] = useState<SensorReading[]>(initialHistory);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (hours: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/devices/${encodeURIComponent(deviceId)}/readings?hours=${hours}`
      );
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    // Only fetch if we need more data than initial 24h
    const hours = getHoursForRange(timeRange);
    if (hours !== 24) {
      fetchHistory(hours);
    } else {
      setHistoryData(initialHistory);
    }
  }, [timeRange, initialHistory, fetchHistory]);

  const handlePanelClick = (metric: MetricType) => {
    if (selectedMetric === metric) {
      setSelectedMetric(null);
    } else {
      setSelectedMetric(metric);
    }
  };

  const handleClose = () => {
    setSelectedMetric(null);
  };

  return (
    <div>
      {/* Metric Panels */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SensorMetricPanel
          type="moisture"
          value={latestReading.soil_moisture}
          selected={selectedMetric === "moisture"}
          onClick={() => handlePanelClick("moisture")}
        />
        <SensorMetricPanel
          type="temperature"
          value={latestReading.soil_temperature}
          selected={selectedMetric === "temperature"}
          onClick={() => handlePanelClick("temperature")}
        />
        <SensorMetricPanel
          type="salinity"
          value={latestReading.electrical_conductivity}
          selected={selectedMetric === "salinity"}
          onClick={() => handlePanelClick("salinity")}
        />
      </div>

      {/* Time Series Chart (expanded when metric selected) */}
      {selectedMetric && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedMetric === "moisture" && "Moisture History"}
              {selectedMetric === "temperature" && "Temperature History"}
              {selectedMetric === "salinity" && "Salinity History"}
            </h3>
            <div className="flex items-center gap-3">
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              <button
                onClick={handleClose}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                aria-label="Close chart"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <TimeSeriesChart data={historyData} metric={selectedMetric} />
          )}
        </div>
      )}
    </div>
  );
}
