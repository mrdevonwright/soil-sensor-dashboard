"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import type { CameraImage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { deleteCameraImage } from "@/app/devices/[deviceId]/actions";
import { toast } from "sonner";

function getCameraImageUrl(storagePath: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camera-images/${storagePath}`;
}

function formatFileSize(bytes: number | null) {
  if (bytes === null) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TIME_RANGES = [
  { label: "6H", hours: 6 },
  { label: "24H", hours: 24 },
  { label: "7D", hours: 168 },
  { label: "30D", hours: 720 },
  { label: "All", hours: 0 },
] as const;

interface CameraGalleryProps {
  deviceId: string;
  initialImages: CameraImage[];
  initialTotal: number;
}

export function CameraGallery({ deviceId, initialImages, initialTotal }: CameraGalleryProps) {
  const [images, setImages] = useState<CameraImage[]>(initialImages);
  const [total, setTotal] = useState(initialTotal);
  const [selectedImage, setSelectedImage] = useState<CameraImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRange, setActiveRange] = useState(24);

  const fetchImages = useCallback(async (hours: number) => {
    setLoading(true);
    try {
      const url = hours > 0
        ? `/api/devices/${encodeURIComponent(deviceId)}/images?hours=${hours}`
        : `/api/devices/${encodeURIComponent(deviceId)}/images`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.images) {
        setImages(data.images);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const handleRangeChange = (hours: number) => {
    setActiveRange(hours);
    fetchImages(hours);
  };

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const [deleting, startDelete] = useTransition();

  const handleDelete = (image: CameraImage) => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    startDelete(async () => {
      const result = await deleteCameraImage(image.id);
      if (result.success) {
        toast.success("Image deleted");
        setImages((prev) => prev.filter((i) => i.id !== image.id));
        setTotal((prev) => prev - 1);
        setSelectedImage(null);
      } else {
        toast.error(result.error ?? "Failed to delete image");
      }
    });
  };

  return (
    <>
      {/* Time range selector */}
      <div className="flex items-center gap-2 mb-4">
        {TIME_RANGES.map(({ label, hours }) => (
          <button
            key={label}
            onClick={() => handleRangeChange(hours)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeRange === hours
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
        {loading && (
          <span className="text-sm text-gray-400 ml-2">Loading...</span>
        )}
      </div>

      {images.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No images for this time period.
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} image{total !== 1 ? "s" : ""}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <img
                  src={getCameraImageUrl(image.storage_path)}
                  alt={`Capture ${image.captured_at}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs">
                    {formatDateTime(image.captured_at)}
                  </p>
                  <p className="text-white/70 text-xs">
                    {formatFileSize(image.file_size_bytes)}
                    {image.width && image.height && ` \u00B7 ${image.width}\u00D7${image.height}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 right-0 flex gap-4">
              <button
                onClick={() => handleDelete(selectedImage)}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white hover:text-gray-300 text-sm"
              >
                Close (Esc)
              </button>
            </div>
            <img
              src={getCameraImageUrl(selectedImage.storage_path)}
              alt={`Capture ${selectedImage.captured_at}`}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-white text-sm flex gap-4">
              <span>{formatDateTime(selectedImage.captured_at)}</span>
              <span>{formatFileSize(selectedImage.file_size_bytes)}</span>
              {selectedImage.width && selectedImage.height && (
                <span>{selectedImage.width}&times;{selectedImage.height}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
