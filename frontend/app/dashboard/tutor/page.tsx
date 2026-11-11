
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    GraduationCap,
    Send,
    Sparkles,
    Bot,
    Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const suggestions = [
    "Explain a difficult concept in simple terms.",
    "Help me understand my lecture notes.",
    "Give me examples of this topic.",
    "Create practice questions for me.",
];

export default function TutorPage() {
    const [message, setMessage] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!message.trim()) {
            toast.error("Please enter a question first.");
            return;
        }

        toast.info("AI Tutor integration is coming soon. Your question hasn't been sent.");
    }

    return (
        <main className="min-h-screen bg-[#faf7f2]">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"
                    >
                        <ArrowLeft size={18} />
                        Dashboard
                    </Link>

                    <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                            <GraduationCap size={21} />
                        </span>
                        LearnLite
                    </Link>
                </div>
            </header>

            <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl flex-col px-4 py-8 sm:px-6">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                        Your personal learning assistant
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        AI Tutor
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Ask questions, understand difficult topics and learn at your own pace.
                    </p>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white">
                    <div className="flex items-center gap-3 border-b border-stone-100 p-5">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <Bot size={23} />
                        </span>

                        <div>
                            <h2 className="font-semibold text-gray-900">LearnLite Assistant</h2>
                            <p className="text-xs text-gray-500">Your study companion</p>
                        </div>

                        <span className="ml-auto rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                            Demo mode
                        </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center sm:px-10">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                            <Sparkles size={30} />
                        </span>

                        <h2 className="mt-6 text-xl font-bold text-gray-900">
                            What would you like to learn today?
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Ask your questions and get help understanding complex concepts,
                            lecture notes and study materials.
                        </p>

                        <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setMessage(suggestion)}
                                    className="flex items-start gap-3 rounded-xl border border-stone-200 p-4 text-left text-sm text-gray-600 transition hover:border-teal-300 hover:bg-teal-50"
                                >
                                    <Lightbulb size={17} className="mt-0.5 shrink-0 text-teal-700" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                            <BookOpen size={15} />
                            AI-powered tutoring will be available after backend integration.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-stone-100 p-4 sm:p-5">
                        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-2">
                            <input
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Ask your learning question..."
                                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                            />

                            <button
                                type="submit"
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-800"
                            >
                                <Send size={18} />
                            </button>
                        </div>

                        <p className="mt-3 text-center text-xs text-gray-400">
                            LearnLite AI Tutor · Demo interface
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}