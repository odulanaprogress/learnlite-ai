"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
    FileText,
    X,
    UploadCloud,
    CheckCircle2,
    FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ACCEPTED_TYPES =
    ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.rtf,application/pdf,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const ALLOWED_EXTENSIONS = [
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "txt",
    "md",
    "rtf",
];

type Props = {
    onSubmit: (file: File) => void;
};

export default function UploadPanel({ onSubmit }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    function handleFile(pickedFile?: File) {
        if (!pickedFile) return;

        const extension = pickedFile.name
            .split(".")
            .pop()
            ?.toLowerCase();

        // Check extension or MIME type
        const isMimeMatch =
            pickedFile.type.includes("pdf") ||
            pickedFile.type.includes("text") ||
            pickedFile.type.includes("word") ||
            pickedFile.type.includes("presentation") ||
            pickedFile.type.includes("document");

        if (!isMimeMatch && (!extension || !ALLOWED_EXTENSIONS.includes(extension))) {
            const message =
                "Unsupported file format. Please select a PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), or TXT/Markdown file.";

            setError(message);
            setFile(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            toast.error("Unsupported file format.", {
                description: "Supported: PDF, Word, PowerPoint, TXT, or MD.",
            });

            return;
        }

        if (pickedFile.size > MAX_SIZE_BYTES) {
            const message = `This file is too large. The maximum allowed size is ${MAX_SIZE_MB} MB.`;

            setError(message);
            setFile(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            toast.error("File is too large.", {
                description: `Maximum allowed size is ${MAX_SIZE_MB} MB.`,
            });

            return;
        }

        setError("");
        setFile(pickedFile);

        toast.success("Document selected from library.", {
            description: pickedFile.name,
        });
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const picked = event.target.files?.[0];
        if (picked) {
            handleFile(picked);
        }
    }

    function handleRemove(e: React.MouseEvent) {
        e.stopPropagation();
        setFile(null);
        setError("");

        if (inputRef.current) {
            inputRef.current.value = "";
        }

        toast.info("Selected file removed.");
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];
        if (!droppedFile) return;

        handleFile(droppedFile);
    }

    function handleContinue() {
        if (!file) {
            toast.error("Please select a document first.");
            return;
        }

        toast.info("Analyzing document and extracting lecture notes...");
        onSubmit(file);
    }

    return (
        <div className="rounded-2xl bg-white p-4 sm:p-5">
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleChange}
                className="hidden"
                id="device-document-upload"
            />

            {!file ? (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                        isDragging
                            ? "border-teal-500 bg-teal-50/70 scale-[0.99]"
                            : "border-stone-300 bg-stone-50/70 hover:border-teal-500 hover:bg-teal-50/30"
                    }`}
                >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 shadow-xs">
                        <UploadCloud size={28} />
                    </span>

                    <h4 className="mt-4 font-bold text-gray-900 text-base">
                        Select a document from your device
                    </h4>

                    <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                        Click anywhere or drag and drop your lecture slides, notes, or course reading.
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">
                        <FolderOpen size={16} />
                        Browse Files
                    </div>

                    <p className="mt-4 text-[11px] text-gray-400">
                        PDF, Word (.docx), PowerPoint (.pptx), or TXT &bull; Max {MAX_SIZE_MB}MB
                    </p>
                </div>
            ) : (
                <div 
                    onClick={() => inputRef.current?.click()}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/60 p-4 transition hover:bg-teal-50"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                            <FileText size={22} />
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">
                                {file.name}
                            </p>

                            <p className="text-xs text-teal-800 flex items-center gap-1.5 mt-0.5 font-medium">
                                <CheckCircle2 size={13} className="text-teal-600" />
                                {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to process
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        aria-label="Remove selected file"
                        title="Remove file"
                        className="shrink-0 rounded-xl p-2 text-gray-400 transition hover:bg-white hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-xl bg-red-50 p-3 text-xs sm:text-sm text-red-600 border border-red-200"
                >
                    {error}
                </p>
            )}

            <button
                type="button"
                disabled={!file}
                onClick={handleContinue}
                className="mt-4 w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 shadow-sm"
            >
                Continue with {file ? file.name.slice(0, 25) + (file.name.length > 25 ? "..." : "") : "Selected File"} &rarr;
            </button>
        </div>
    );
}
