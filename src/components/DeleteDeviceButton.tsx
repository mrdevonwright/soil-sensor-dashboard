"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteDeviceButton({ deviceId }: { deviceId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    const res = await fetch(`/api/devices/${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  }

  if (deleting) {
    return (
      <span className="text-xs text-gray-400 px-2">Deleting...</span>
    );
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
        <button
          onClick={handleDelete}
          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Confirm
        </button>
        <button
          onClick={handleCancel}
          className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="text-gray-300 hover:text-red-500 p-1"
      title="Delete device"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
