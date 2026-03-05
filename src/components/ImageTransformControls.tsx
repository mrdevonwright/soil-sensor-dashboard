"use client";

import { useState, useTransition } from "react";
import { updateImageTransform } from "@/app/devices/[deviceId]/actions";
import { toast } from "sonner";

interface ImageTransformControlsProps {
  deviceId: string;
  initialRotation: number;
  initialMirror: boolean;
}

export function ImageTransformControls({
  deviceId,
  initialRotation,
  initialMirror,
}: ImageTransformControlsProps) {
  const [rotation, setRotation] = useState(initialRotation);
  const [mirror, setMirror] = useState(initialMirror);
  const [saving, startSave] = useTransition();

  function save(newRotation: number, newMirror: boolean) {
    setRotation(newRotation);
    setMirror(newMirror);
    startSave(async () => {
      const result = await updateImageTransform(deviceId, {
        image_rotation: newRotation,
        image_mirror: newMirror,
      });
      if (!result.success) {
        toast.error(result.error ?? "Failed to save transform");
        setRotation(initialRotation);
        setMirror(initialMirror);
      }
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">Image:</span>
      <button
        onClick={() => save((rotation + 315) % 360, mirror)}
        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
        title="Rotate left 45°"
        disabled={saving}
      >
        ↺
      </button>
      <button
        onClick={() => save((rotation + 45) % 360, mirror)}
        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
        title="Rotate right"
        disabled={saving}
      >
        ↻
      </button>
      <button
        onClick={() => save(rotation, !mirror)}
        className={`px-2 py-1 rounded text-gray-700 ${
          mirror ? "bg-purple-100 hover:bg-purple-200" : "bg-gray-100 hover:bg-gray-200"
        }`}
        title="Mirror horizontal"
        disabled={saving}
      >
        ⇔
      </button>
      {(rotation !== 0 || mirror) && (
        <span className="text-xs text-gray-400">
          {rotation > 0 && `${rotation}°`}
          {rotation > 0 && mirror && " + "}
          {mirror && "mirrored"}
        </span>
      )}
    </div>
  );
}
