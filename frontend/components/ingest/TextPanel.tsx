"use client";

import { useState } from "react";

const MAX_CHARS = 20000;

type Props = {
  onSubmit: (text: string) => void;
};

export default function TextPanel({ onSubmit }: Props) {
  const [text, setText] = useState("");

  const trimmed = text.trim();
  const nearLimit = text.length > MAX_CHARS * 0.9;

  return (
    <div className="rounded-2xl bg-white p-4">
      <label htmlFor="notes-text" className="mb-2 block font-medium text-gray-900">
        Your notes
      </label>

      <textarea
        id="notes-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={MAX_CHARS}
        rows={8}
        placeholder="Type or paste your notes here..."
        className="w-full resize-none rounded-xl border border-gray-200 bg-stone-50 p-3 text-gray-900 outline-none focus:border-teal-500"
      />

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className={nearLimit ? "text-orange-600" : "text-gray-500"}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
        {text.length > 0 && (
          <button
            type="button"
            onClick={() => setText("")}
            className="text-gray-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={trimmed.length === 0}
        onClick={() => onSubmit(trimmed)}
        className="mt-4 w-full rounded-xl bg-orange-600 py-3 font-medium text-white disabled:bg-gray-200 disabled:text-gray-400"
      >
        Continue
      </button>
    </div>
  );
}