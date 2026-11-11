
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
    FileText,
    X,
    UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.txt";

const ALLOWED_EXTENSIONS = [
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "txt",
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

        if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
            const message =
                "Unsupported file format. Please select a PDF, Word, PowerPoint or TXT file.";

            setError(message);
            setFile(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            toast.error("Unsupported file format.", {
                description: "Please select a PDF, Word, PowerPoint or TXT file.",
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
                description: `Maximum allowed file size is ${MAX_SIZE_MB} MB.`,
            });

            return;
        }

        setError("");
        setFile(pickedFile);

        toast.success("File selected successfully.", {
            description: pickedFile.name,
        });
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        handleFile(event.target.files?.[0]);
    }

    function handleRemove() {
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

        toast.info("Preparing your document...");
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
            />

            {!file ? (
                <div
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`rounded-xl border border-dashed p-6 text-center transition-colors ${isDragging
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                >
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <UploadCloud size={23} />
                    </span>

                    <p className="mt-3 font-semibold text-gray-900">
                        Drop your document here
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Or choose a file from your device
                    </p>

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="mt-4 rounded-xl border border-teal-600 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                    >
                        Browse files
                    </button>

                    <p className="mt-4 text-xs text-gray-400">
                        PDF, DOC, DOCX, PPT, PPTX or TXT · Maximum {MAX_SIZE_MB} MB
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <FileText size={20} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            {file.name}
                        </p>

                        <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        aria-label="Remove selected file"
                        className="shrink-0 rounded-full p-2 text-gray-500 transition hover:bg-white hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                    {error}
                </p>
            )}

            <button
                type="button"
                disabled={!file}
                onClick={handleContinue}
                className="mt-4 w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
                Continue
            </button>
        </div>
    );
}