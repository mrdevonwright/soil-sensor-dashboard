"use client";

import { DEPTH_LABELS } from "@/lib/types";

interface DepthLevelSelectorProps {
  selectedLevels: number[];
  onChange: (levels: number[]) => void;
}

export function DepthLevelSelector({
  selectedLevels,
  onChange,
}: DepthLevelSelectorProps) {
  const toggleLevel = (level: number) => {
    if (selectedLevels.includes(level)) {
      onChange(selectedLevels.filter((l) => l !== level));
    } else {
      onChange([...selectedLevels, level].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    onChange([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  };

  const selectNone = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Depth Levels</span>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={selectNone}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {DEPTH_LABELS.map((label, index) => (
          <button
            key={index}
            onClick={() => toggleLevel(index)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              selectedLevels.includes(index)
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
