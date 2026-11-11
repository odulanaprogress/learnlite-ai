
"use client";

import { useState } from "react";
import { Bot, Send, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const MAX_CHARS = 20000;

type Props = {
    onSubmit: (text: string) => void;
};

export default function TextPanel({ onSubmit }: Props) {
    const [text, setText] = useState("");

    const trimmed = text.trim();
    const nearLimit = text.length > MAX_CHARS * 0.9;

    function handleSubmit() {
        if (!trimmed) {
            toast.error("Please enter or paste your lecture notes.");
            return;
        }

        if (trimmed.length > MAX_CHARS) {
            toast.error("Your notes exceed the maximum character limit.");
            return;
        }

        toast.info("Your notes are being prepared...");
        onSubmit(trimmed);
    }

    function handleClear() {
        if (!text) return;

        setText("");
        toast.success("Your notes have been cleared.");
    }

    function handleTextChange(value: string) {
        setText(value);

        if (value.length === MAX_CHARS) {
            toast.warning("You've reached the 20,000-character limit.");
        }
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Bot size={23} />
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900">
                        LearnLite Assistant
                    </h3>
                    <p className="text-xs text-green-600">
                        Ready to help you study
                    </p>
                </div>

                <div className="ml-auto flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    <Sparkles size={13} />
                    AI Learning
                </div>
            </div>

            {/* Conversation area */}
            <div className="space-y-5 bg-[#faf7f2] p-4 sm:p-5">
                <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <Bot size={17} />
                    </div>

                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                        <p className="text-sm leading-6 text-gray-700">
                            Hello! 👋 Ready to make your learning easier?
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Paste your lecture notes below. Ill help turn them into
                            summaries, flashcards and practice quizzes.
                        </p>
                    </div>
                </div>

                {/* User input */}
                <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                    <label
                        htmlFor="notes-text"
                        className="mb-3 block text-sm font-semibold text-gray-900"
                    >
                        Your lecture notes
                    </label>

                    <textarea
                        id="notes-text"
                        value={text}
                        onChange={(event) => handleTextChange(event.target.value)}
                        maxLength={MAX_CHARS}
                        rows={7}
                        placeholder="Paste or type your lecture notes here..."
                        className="w-full resize-y rounded-xl border border-gray-200 bg-stone-50 p-3 text-sm leading-6 text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                            className={`text-xs ${nearLimit ? "text-orange-600" : "text-gray-400"
                                }`}
                        >
                            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                        </span>

                        {text.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-red-600"
                            >
                                <Trash2 size={13} />
                                Clear notes
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={!trimmed}
                        onClick={handleSubmit}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        Generate learning materials
                        <Send size={17} />
                    </button>
                </div>

                <p className="text-center text-xs leading-5 text-gray-400">
                    Your notes will be processed into learning materials.
                </p>
            </div>
        </div>
    );
}