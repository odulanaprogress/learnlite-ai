"use client";

import { Check, Loader2, Circle } from "lucide-react";

const steps = [
  "Uploading your notes",
  "Reading the content",
  "Building your study material",
];

type Props = {
  step: number;
  onCancel: () => void;
};

export default function ProcessingScreen({ step, onCancel }: Props) {
  const percent = Math.round((step / steps.length) * 100);

  return (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="mb-1 text-lg font-bold">Working on your notes</h3>
      <p className="mb-4 text-sm text-gray-500">
        This can take a little longer on a slow connection. Please keep this
        page open.
      </p>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mb-4 h-2 w-full rounded-full bg-gray-100"
      >
        <div
          className="h-2 rounded-full bg-teal-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-3">
        {steps.map((label, index) => {
          const done = index < step;
          const current = index === step;

          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? "bg-green-100 text-green-700"
                    : current
                    ? "bg-teal-100 text-teal-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done && <Check size={16} />}
                {current && <Loader2 size={16} className="animate-spin" />}
                {!done && !current && <Circle size={16} />}
              </span>
              <span
                className={
                  done || current ? "text-gray-900" : "text-gray-400"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onCancel}
        className="mt-6 w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-900"
      >
        Cancel
      </button>
    </div>
  );
}