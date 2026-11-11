
"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Camera,
    PenLine,
    type LucideIcon,
    CheckCircle2,
    Plus,
} from "lucide-react";
import { toast } from "sonner";

import UploadPanel from "../ingest/UploadPanel";
import CameraPanel from "../ingest/CameraPanel";
import TextPanel from "../ingest/TextPanel";
import ProcessingScreen from "../processing/ProcessingScreen";
import { saveLibraryMaterial } from "@/lib/library";

type Mode = "upload" | "snap" | "text";
type Phase = "pick" | "processing" | "done";

type Submission = {
    name: string;
    type: string;
};

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
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [pendingPayload, setPendingPayload] = useState<File | string | null>(
        null
    );

    useEffect(() => {
        if (phase !== "processing" || pendingPayload === null) return;

        const timer = window.setTimeout(async () => {
            if (step < TOTAL_STEPS - 1) {
                setStep((current) => current + 1);
                return;
            }

            try {
                await saveLibraryMaterial(pendingPayload);

                setPhase("done");

                toast.success("Material saved successfully!", {
                    description: "Your material is now available in your local library.",
                });
            } catch (error) {
                console.error("Could not save material:", error);

                toast.error("Unable to save material.", {
                    description: "Please try again.",
                });

                setStep(0);
                setPendingPayload(null);
                setPhase("pick");
            }
        }, STEP_MS);

        return () => window.clearTimeout(timer);
    }, [phase, step, pendingPayload]);

    function startProcessing(payload: File | string) {
        const details: Submission =
            typeof payload === "string"
                ? {
                    name: "Pasted lecture notes",
                    type: "Text notes",
                }
                : {
                    name: payload.name,
                    type: payload.type.startsWith("image/")
                        ? "Captured image"
                        : "Uploaded document",
                };

        setSubmission(details);
        setPendingPayload(payload);
        setStep(0);
        setPhase("processing");
    }

    function cancelProcessing() {
        setStep(0);
        setPendingPayload(null);
        setPhase("pick");

        toast.info("Processing cancelled.");
    }

    function reset() {
        setPhase("pick");
        setStep(0);
        setMode(null);
        setSubmission(null);
        setPendingPayload(null);
    }

    return (
        <section className="mx-auto w-full max-w-md p-4 lg:max-w-4xl lg:p-8">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">
                    Add your material
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Bring your lecture notes and turn them into learning resources.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {/* Material selection */}
                <div className="grid gap-3 rounded-3xl bg-[#e3ede7] p-3">
                    <p className="px-1 pt-1 text-sm font-semibold text-gray-900">
                        Choose how you want to add your notes:
                    </p>

                    {options.map(({ id, title, description, Icon, circle }) => (
                        <button
                            key={id}
                            type="button"
                            disabled={phase === "processing"}
                            onClick={() => setMode(id)}
                            className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${mode === id
                                    ? "border-teal-500 ring-2 ring-teal-100"
                                    : "border-transparent hover:border-gray-200"
                                }`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${circle}`}
                            >
                                <Icon size={20} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block font-medium text-gray-900">
                                    {title}
                                </span>

                                <span className="block text-sm text-gray-500">
                                    {description}
                                </span>
                            </span>

                            {mode === id && (
                                <CheckCircle2 size={18} className="text-teal-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Material content */}
                <div className="min-w-0">
                    {/* Processing */}
                    {phase === "processing" && (
                        <ProcessingScreen
                            step={step}
                            onCancel={cancelProcessing}
                        />
                    )}

                    {/* Successful save */}
                    {phase === "done" && (
                        <div className="rounded-3xl border border-gray-100 bg-white p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                                <CheckCircle2 size={25} />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">
                                Material saved!
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Your material has been saved to your local library on this
                                device. AI analysis will be available after the backend is
                                connected.
                            </p>

                            {submission && (
                                <div className="mt-5 rounded-xl bg-stone-50 p-3">
                                    <p className="text-xs text-gray-500">
                                        Saved material
                                    </p>

                                    <p className="mt-1 break-all text-sm font-medium text-gray-900">
                                        {submission.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {submission.type}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={reset}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 font-medium text-white transition-colors hover:bg-teal-800"
                            >
                                <Plus size={18} />
                                Add another material
                            </button>
                        </div>
                    )}

                    {/* Material selection panels */}
                    {phase === "pick" && (
                        <>
                            {mode === null && (
                                <div className="hidden rounded-3xl border border-dashed border-gray-300 p-10 text-center lg:block">
                                    <FileText
                                        size={35}
                                        className="mx-auto mb-3 text-gray-400"
                                    />

                                    <p className="font-medium text-gray-700">
                                        Your learning journey starts here.
                                    </p>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Select an option to add your lecture materials.
                                    </p>
                                </div>
                            )}

                            {mode === "upload" && (
                                <UploadPanel onSubmit={startProcessing} />
                            )}

                            {mode === "snap" && (
                                <CameraPanel onSubmit={startProcessing} />
                            )}

                            {mode === "text" && (
                                <TextPanel onSubmit={startProcessing} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}