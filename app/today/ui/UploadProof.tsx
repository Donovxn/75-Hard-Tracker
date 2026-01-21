"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProofAction } from "../actions";

export default function UploadProof({ checkinItemId }: { checkinItemId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onUpload = () => {
    setError(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Pick an image first.");
      return;
    }

    const fd = new FormData();
    fd.set("checkinItemId", checkinItemId);
    fd.set("file", file);

    startTransition(async () => {
      try {
        await uploadProofAction(fd);
        if (inputRef.current) inputRef.current.value = "";
      } catch (e: any) {
        setError(e?.message ?? "Upload failed");
      }
    });
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="block w-full text-xs text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-xs file:text-neutral-200 hover:file:bg-neutral-700"
        />
        <button
          onClick={onUpload}
          disabled={isPending}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
        >
          {isPending ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error ? <div className="text-xs text-red-400">{error}</div> : null}
      <div className="text-[11px] text-neutral-500">Max 4MB. JPG/PNG/WebP.</div>
    </div>
  );
}
