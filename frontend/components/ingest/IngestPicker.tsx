"use client";

import { useState } from "react";
import { FileText, Camera, PenLine, type LucideIcon } from "lucide-react";
import UploadPanel from "../ingest/UploadPanel";

type Mode = "upload" | "snap" | "text";

const options: {
  id: Mode;
  title: string;
  description: string;
  Icon: LucideIcon;
  circle: string;
}[] = [
  {
    id: "upload",
    title: "Upload",
    description: "PDF, Word or slides from your device",
    Icon: FileText,
    circle: "bg-teal-100 text-teal-700",
  },
  {
    id: "snap",
    title: "Take a snap",
    description: "Photograph handwritten or printed notes",
    Icon: Camera,
    circle: "bg-orange-100 text-orange-600",
  },
  {
    id: "text",
    title: "Type or paste",
    description: "Write or paste your notes as text",
    Icon: PenLine,
    circle: "bg-green-100 text-green-700",
  },
];

export default function IngestPicker() {
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <section className="mx-auto max-w-md p-4">
      <h2 className="mb-4 text-xl font-bold">Add your material</h2>

      <div className="grid gap-3 rounded-3xl bg-[#e3ede7] p-3">
        <p className="px-1 pt-1 text-sm font-semibold text-gray-900">
          Choose how you want to add your notes:
        </p>

        {options.map(({ id, title, description, Icon, circle }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-colors ${
              mode === id ? "border-teal-500" : "border-transparent"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${circle}`}
            >
              <Icon size={20} />
            </span>
            <span>
              <span className="block font-medium text-gray-900">{title}</span>
              <span className="block text-sm text-gray-500">{description}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {mode === "upload" && (
          <UploadPanel onSubmit={(file) => console.log("Chosen file:", file)} />
        )}
        {mode === "snap" && <p>Camera panel goes here</p>}
        {mode === "text" && <p>Text panel goes here</p>}
      </div>
    </section>
  );
}