"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
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

function getTransformStyle(rotation: number, mirror: boolean): React.CSSProperties {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (mirror) transforms.push("scaleX(-1)");
  if (transforms.length === 0) return {};

  // For non-0/180 rotations, scale down to fit the container
  const r = rotation % 360;
  if (r !== 0 && r !== 180) transforms.push("scale(0.75)");

  return { transform: transforms.join(" ") };
}

const TIME_RANGES = [
  { label: "6H", hours: 6 },
  { label: "24H", hours: 24 },
  { label: "7D", hours: 168 },
  { label: "30D", hours: 720 },
  { label: "All", hours: 0 },
] as const;

type ViewMode = "grid" | "list";

interface CameraGalleryProps {
  deviceId: string;
  initialImages: CameraImage[];
  initialTotal: number;
  imageRotation?: number;
  imageMirror?: boolean;
}

export function CameraGallery({
  deviceId,
  initialImages,
  initialTotal,
  imageRotation = 0,
  imageMirror = false,
}: CameraGalleryProps) {
  const [images, setImages] = useState<CameraImage[]>(initialImages);
  const [total, setTotal] = useState(initialTotal);
  const [selectedImage, setSelectedImage] = useState<CameraImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRange, setActiveRange] = useState(24);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const lastSelectedIndex = useRef<number | null>(null);

  const transformStyle = getTransformStyle(imageRotation, imageMirror);

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
        setSelectedIds(new Set());
        lastSelectedIndex.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const handleRangeChange = (hours: number) => {
    setActiveRange(hours);
    fetchImages(hours);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedImage) setSelectedImage(null);
        else if (selectedIds.size > 0) setSelectedIds(new Set());
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedImage, selectedIds]);

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

  const handleSelect = (id: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.shiftKey && lastSelectedIndex.current !== null) {
      // Shift+click: range select
      const start = Math.min(lastSelectedIndex.current, index);
      const end = Math.max(lastSelectedIndex.current, index);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (let i = start; i <= end; i++) {
          next.add(images[i].id);
        }
        return next;
      });
    } else {
      // Normal click: toggle
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
    lastSelectedIndex.current = index;
  };

  const selectAll = () => {
    setSelectedIds(new Set(images.map((i) => i.id)));
    lastSelectedIndex.current = images.length - 1;
  };
  const clearSelection = () => {
    setSelectedIds(new Set());
    lastSelectedIndex.current = null;
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.size} image${selectedIds.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    startDelete(async () => {
      let deleted = 0;
      for (const id of selectedIds) {
        const result = await deleteCameraImage(id);
        if (result.success) deleted++;
      }
      setImages((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setTotal((prev) => prev - deleted);
      setSelectedIds(new Set());
      lastSelectedIndex.current = null;
      toast.success(`Deleted ${deleted} image${deleted > 1 ? "s" : ""}`);
    });
  };

  const handleBulkDownload = async () => {
    const toDownload = images.filter((i) => selectedIds.has(i.id));
    toast.info(`Downloading ${toDownload.length} image${toDownload.length > 1 ? "s" : ""}...`);
    for (const image of toDownload) {
      try {
        const url = getCameraImageUrl(image.storage_path);
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${image.captured_at.replace(/[:.]/g, "-")}.jpg`;
        a.click();
        URL.revokeObjectURL(a.href);
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        toast.error(`Failed to download image from ${image.captured_at}`);
      }
    }
  };

  // Shared checkbox element
  const renderCheckbox = (image: CameraImage, index: number, alwaysVisible: boolean) => {
    const isSelected = selectedIds.has(image.id);
    return (
      <div
        className={`transition-opacity ${
          alwaysVisible || selectedIds.size > 0 || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => handleSelect(image.id, index, e)}
      >
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
            isSelected
              ? "bg-purple-600 border-purple-600"
              : "bg-white/80 border-gray-400 hover:border-purple-500"
          }`}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Controls bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
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
            <span className="text-sm text-gray-600 ml-2">Loading...</span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 text-sm rounded-md transition-colors ${
              viewMode === "grid" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 text-sm rounded-md transition-colors ${
              viewMode === "list" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <span className="text-sm font-medium text-purple-800">
            {selectedIds.size} selected
          </span>
          <button
            onClick={selectAll}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Select all
          </button>
          <button
            onClick={clearSelection}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Clear
          </button>
          <div className="flex-1" />
          <button
            onClick={handleBulkDownload}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Download ({selectedIds.size})
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : `Delete (${selectedIds.size})`}
          </button>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No images for this time period.
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} image{total !== 1 ? "s" : ""}
            {viewMode === "list" && selectedIds.size === 0 && (
              <span className="text-gray-600 ml-2">(Shift+click to range select)</span>
            )}
          </p>

          {viewMode === "grid" ? (
            /* ===== Grid View ===== */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => {
                const isSelected = selectedIds.has(image.id);
                return (
                  <div
                    key={image.id}
                    className={`group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-purple-500 ring-offset-2"
                        : "hover:ring-2 hover:ring-purple-500"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={getCameraImageUrl(image.storage_path)}
                      alt={`Capture ${image.captured_at}`}
                      className="w-full h-full object-cover"
                      style={transformStyle}
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 z-10">
                      {renderCheckbox(image, index, false)}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs">
                        {formatDateTime(image.captured_at)}
                      </p>
                      <p className="text-white/70 text-xs">
                        {formatFileSize(image.file_size_bytes)}
                        {image.width && image.height && ` \u00B7 ${image.width}\u00D7${image.height}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ===== List View ===== */
            <div className="border rounded-lg divide-y">
              {images.map((image, index) => {
                const isSelected = selectedIds.has(image.id);
                return (
                  <div
                    key={image.id}
                    className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-purple-50" : "hover:bg-gray-50"
                    }`}
                    onClick={(e) => handleSelect(image.id, index, e)}
                  >
                    {renderCheckbox(image, index, true)}
                    <div
                      className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(image); }}
                    >
                      <img
                        src={getCameraImageUrl(image.storage_path)}
                        alt={`Capture ${image.captured_at}`}
                        className="w-full h-full object-cover"
                        style={transformStyle}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(image.captured_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(image.file_size_bytes)}
                        {image.width && image.height && ` \u00B7 ${image.width}\u00D7${image.height}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              <a
                href={getCameraImageUrl(selectedImage.storage_path)}
                download={`${selectedImage.captured_at.replace(/[:.]/g, "-")}.jpg`}
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </a>
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
              style={transformStyle}
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
