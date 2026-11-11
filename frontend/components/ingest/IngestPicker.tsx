"use client";

import { useEffect, useState } from "react";
import { FileText, Camera, PenLine, type LucideIcon } from "lucide-react";
import UploadPanel from "../ingest/UploadPanel";
import CameraPanel from "../ingest/CameraPanel";
import TextPanel from "../ingest/TextPanel";
import ProcessingScreen from "../processing/ProcessingScreen";

type Mode = "upload" | "snap" | "text";
type Phase = "pick" | "processing" | "done";

const TOTAL_STEPS = 3;
const STEP_MS = 1500;

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
  const [phase, setPhase] = useState<Phase>("pick");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== "processing") return;

    const id = setTimeout(() => {
      if (step + 1 >= TOTAL_STEPS) setPhase("done");
      setStep(step + 1);
    }, STEP_MS);

    return () => clearTimeout(id);
  }, [phase, step]);

  function startProcessing(payload: File | string) {
    console.log("Submitted:", payload);
    setStep(0);
    setPhase("processing");
  }

  function reset() {
    setPhase("pick");
    setStep(0);
    setMode(null);
  }

  return (
    <section className="mx-auto w-full max-w-md p-4 lg:max-w-4xl lg:p-8">
      <h2 className="mb-4 text-xl font-bold lg:mb-6 lg:text-2xl">
        Add your material
      </h2>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-3 rounded-3xl bg-[#e3ede7] p-3">
          <p className="px-1 pt-1 text-sm font-semibold text-gray-900">
            Choose how you want to add your notes:
          </p>

          {options.map(({ id, title, description, Icon, circle }) => (
            <button
              key={id}
              type="button"
              disabled={phase === "processing"}
              onClick={() => {
                setMode(id);
                setPhase("pick");
              }}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-colors disabled:opacity-50 ${
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
                <span className="block text-sm text-gray-500">
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div>
          {phase === "processing" && (
            <ProcessingScreen step={step} onCancel={() => setPhase("pick")} />
          )}

          {phase === "done" && (
            <div className="rounded-2xl bg-white p-6 text-center">
              <p className="font-medium text-gray-900">
                Your study material will appear here.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-900"
              >
                Add more notes
              </button>
            </div>
          )}

          {phase === "pick" && (
            <>
              {mode === null && (
                <div className="hidden rounded-3xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 lg:block">
                  Your chosen option will appear here.
                </div>
              )}
              {mode === "upload" && <UploadPanel onSubmit={startProcessing} />}
              {mode === "snap" && <CameraPanel onSubmit={startProcessing} />}
              {mode === "text" && <TextPanel onSubmit={startProcessing} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}