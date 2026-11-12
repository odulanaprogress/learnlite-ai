"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FileText,
    Camera,
    PenLine,
    type LucideIcon,
    CheckCircle2,
    Plus,
    Layers,
    ClipboardList,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import UploadPanel from "../ingest/UploadPanel";
import CameraPanel from "../ingest/CameraPanel";
import TextPanel from "../ingest/TextPanel";
import ProcessingScreen from "../processing/ProcessingScreen";
import { saveLibraryMaterial, saveGeneratedResource } from "@/lib/library";
import { api, type StudyPack } from "@/lib/api";

type Mode = "upload" | "snap" | "text";
type Phase = "pick" | "processing" | "done";

type Submission = {
    name: string;
    type: string;
};

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
    const [latestPack, setLatestPack] = useState<StudyPack | null>(null);

    async function startProcessing(payload: File | string) {
        const isText = typeof payload === "string";
        const details: Submission = isText
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
        setStep(0);
        setPhase("processing");

        try {
            // 1. Process document & generate study resources via live backend SSE pipeline
            const pack = await api.documents.processAndGenerate({
                file: !isText ? payload : undefined,
                text: isText ? payload : undefined,
                filename: !isText ? payload.name : "Lecture Notes",
                difficulty: "intermediate",
                onProgress: (evt) => {
                    if (evt.stage === "upload") setStep(0);
                    else if (evt.stage === "extracted") setStep(1);
                    else if (evt.stage === "generating") setStep(2);
                    else if (evt.stage === "completed") setStep(3);
                },
            });

            // 2. Save original document with extracted text content to local IndexedDB library
            const extractedContent = isText 
                ? (payload as string) 
                : (pack.summary ? `Summary & Concepts for ${pack.filename}:\n${pack.summary}\n\nKey Concepts:\n` + (pack.key_concepts || []).map(k => `${k.term}: ${k.definition}`).join("\n") : undefined);
            const savedSource = await saveLibraryMaterial(payload, extractedContent);

            // 3. Save AI summary, flashcards and quiz into local library
            if (pack.summary) {
                await saveGeneratedResource({
                    title: `${pack.filename} Summary`,
                    resourceType: "AI Summary",
                    content: pack.summary,
                    sourceMaterialId: savedSource.id,
                });
            }

            if (pack.flashcards && pack.flashcards.length > 0) {
                await saveGeneratedResource({
                    title: `${pack.filename} Flashcards (${pack.flashcards.length})`,
                    resourceType: "Flashcards",
                    content: JSON.stringify(pack.flashcards),
                    sourceMaterialId: savedSource.id,
                });
            }

            if (pack.quiz && pack.quiz.length > 0) {
                await saveGeneratedResource({
                    title: `${pack.filename} Practice Quiz (${pack.quiz.length} Questions)`,
                    resourceType: "Quiz",
                    content: JSON.stringify(pack.quiz),
                    sourceMaterialId: savedSource.id,
                });
            }

            setLatestPack(pack);
            setPhase("done");

            toast.success("Study material created successfully!", {
                description: `Generated summary, ${pack.flashcards?.length || 0} flashcards, and ${pack.quiz?.length || 0} quiz questions.`,
            });
        } catch (error: any) {
            console.error("AI pipeline error:", error);
            toast.error("Processing failed: " + (error.message || "Please check your network and try again."));
            setPhase("pick");
        }
    }

    function cancelProcessing() {
        setStep(0);
        setPhase("pick");
        toast.info("Processing cancelled.");
    }

    function reset() {
        setPhase("pick");
        setStep(0);
        setMode(null);
        setSubmission(null);
        setLatestPack(null);
    }

    return (
        <section className="mx-auto w-full max-w-md p-4 lg:max-w-4xl lg:p-8">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">
                    Add your material
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Bring your lecture notes and turn them into AI summaries, flashcards, and quizzes.
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
                    {/* Real-Time Processing */}
                    {phase === "processing" && (
                        <ProcessingScreen
                            step={step}
                            onCancel={cancelProcessing}
                        />
                    )}

                    {/* Successful real-time generation */}
                    {phase === "done" && (
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                                <Sparkles size={25} />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">
                                Study Pack Ready!
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Your material has been academically analyzed. Summaries, active-recall flashcards, and practice quiz questions are ready for review.
                            </p>

                            {submission && (
                                <div className="mt-5 rounded-xl bg-stone-50 p-3.5">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Source Material
                                    </p>

                                    <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                                        {submission.name}
                                    </p>

                                    <p className="mt-1 text-xs text-teal-700 font-medium">
                                        {latestPack?.flashcards?.length || 0} Flashcards &bull; {latestPack?.quiz?.length || 0} Quiz Questions
                                    </p>
                                </div>
                            )}

                            {/* Direct study action links */}
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Link
                                    href="/dashboard/flashcards"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition"
                                >
                                    <Layers size={17} />
                                    Review Cards
                                </Link>

                                <Link
                                    href="/dashboard/quizzes"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition"
                                >
                                    <ClipboardList size={17} />
                                    Take Quiz
                                </Link>
                            </div>

                            <button
                                type="button"
                                onClick={reset}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-stone-50"
                            >
                                <Plus size={17} />
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
                                        Select an option on the left to add lecture slides, notes, or photos.
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
