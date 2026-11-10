"use client";

import { useRef, useState } from "react";
import { FileUp, FileText, X } from "lucide-react";

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.txt";

type Props = {
  onSubmit: (file: File) => void;
};

export default function UploadPanel({ onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) return;

    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`This file is too large. The maximum is ${MAX_SIZE_MB} MB.`);
      setFile(null);
      return;
    }

    setError("");
    setFile(picked);
  }

  function handleRemove() {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleChange}
        className="hidden"
      />

      {!file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 p-6 text-center"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <FileUp size={20} />
          </span>
          <span className="font-medium text-gray-900">Choose a document</span>
          <span className="text-sm text-gray-500">
            PDF, Word, slides or text. Up to {MAX_SIZE_MB} MB.
          </span>
        </button>
      )}

      {file && (
        <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <FileText size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove file"
            className="shrink-0 rounded-full p-2 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!file}
        onClick={() => file && onSubmit(file)}
        className="mt-4 w-full rounded-xl bg-orange-600 py-3 font-medium text-white disabled:bg-gray-200 disabled:text-gray-400"
      >
        Continue
      </button>
    </div>
  );
}