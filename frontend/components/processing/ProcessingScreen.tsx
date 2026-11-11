
"use client";

import { Check, Loader2, Circle, X } from "lucide-react";

const steps = [
    {
        title: "Uploading your notes",
        description: "Preparing your submitted material",
    },
    {
        title: "Reading the content",
        description: "Extracting useful information",
    },
    {
        title: "Building your study material",
        description: "Preparing summaries, flashcards and quizzes",
    },
];

type Props = {
    step: number;
    onCancel: () => void;
};

export default function ProcessingScreen({ step, onCancel }: Props) {
    const percent = Math.round((step / steps.length) * 100);

    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        Preparing your notes
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                        Your learning materials are being prepared.
                    </p>
                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Loader2 size={21} className="animate-spin motion-reduce:animate-none" />
                </span>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                        Progress
                    </span>

                    <span className="text-sm font-semibold text-teal-700">
                        {percent}%
                    </span>
                </div>

                <div
                    role="progressbar"
                    aria-label="Study material preparation progress"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
                >
                    <div
                        className="h-full rounded-full bg-teal-600 transition-all duration-500 motion-reduce:transition-none"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {/* Processing steps */}
            <div
                className="space-y-5"
                aria-live="polite"
                aria-atomic="true"
            >
                {steps.map((item, index) => {
                    const done = index < step;
                    const current = index === step;

                    return (
                        <div key={item.title} className="flex items-start gap-3">
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done
                                        ? "bg-green-100 text-green-700"
                                        : current
                                            ? "bg-teal-100 text-teal-700"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {done && <Check size={17} />}

                                {current && (
                                    <Loader2
                                        size={17}
                                        className="animate-spin motion-reduce:animate-none"
                                    />
                                )}

                                {!done && !current && <Circle size={17} />}
                            </span>

                            <div className="pt-0.5">
                                <p
                                    className={`text-sm font-semibold ${done || current
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {item.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    {item.description}
                                </p>
                            </div>

                            {done && (
                                <span className="ml-auto text-xs font-medium text-green-700">
                                    Done
                                </span>
                            )}

                            {current && (
                                <span className="ml-auto text-xs font-medium text-teal-700">
                                    Active
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Demo notice */}
            <div className="mt-6 rounded-xl bg-stone-50 p-3">
                <p className="text-xs leading-5 text-gray-500">
                    This is the frontend processing preview. Actual document
                    processing and AI generation will be connected through the
                    backend API.
                </p>
            </div>

            {/* Cancel */}
            <button
                type="button"
                onClick={onCancel}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
                <X size={16} />
                Cancel processing
            </button>
        </div>
    );
}