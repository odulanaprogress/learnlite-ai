"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    GraduationCap,
    Send,
    Sparkles,
    Bot,
    Lightbulb,
    User,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api, type TutorSource } from "@/lib/api";
import { getLibraryMaterials, type LibraryMaterial } from "@/lib/library";

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: TutorSource[];
};

const suggestions = [
    "Explain the core concept of my lecture notes in simple terms.",
    "What are the main definitions I need to remember for my exam?",
    "Give me practical real-world examples of this topic.",
    "Summarize the key formulas or rules discussed in this material.",
];

export default function TutorPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState<LibraryMaterial[]>([]);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getLibraryMaterials().then(setMaterials).catch(() => {});
    }, []);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function handleSend(questionText?: string) {
        const query = (questionText || message).trim();
        if (!query) {
            toast.error("Please enter a question first.");
            return;
        }

        setMessage("");
        const newHistory: Message[] = [...messages, { role: "user", content: query }];
        setMessages(newHistory);
        setLoading(true);

        try {
            // Build context pages from user's library or latest study pack
            const pages = materials.flatMap((m, idx) => {
                const text = m.textContent?.trim();
                if (!text) return [];
                return [{ page_number: idx + 1, text: text.slice(0, 3000) }];
            });

            // If user hasn't uploaded notes yet, provide basic university study grounding
            const defaultPages = pages.length > 0 ? pages : [
                {
                    page_number: 1,
                    text: "University coursework and foundational academic principles. The student is reviewing study materials, key terms, definitions, and exam preparation concepts."
                }
            ];

            const response = await api.tutor.ask({
                question: query,
                pages: defaultPages,
                filename: materials[0]?.name || "Lecture Notes",
                history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.answer,
                    sources: response.sources,
                },
            ]);
        } catch (err: any) {
            toast.error("AI Tutor response error: " + (err.message || "Please check connection."));
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "I encountered a network issue communicating with the AI service. Please verify your connection and try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        handleSend();
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
                        Ask questions, understand difficult topics and learn at your own pace grounded in your notes.
                    </p>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-stone-100 p-5">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <Bot size={23} />
                        </span>

                        <div>
                            <h2 className="font-semibold text-gray-900">LearnLite Assistant</h2>
                            <p className="text-xs text-gray-500">Live AI Tutor &bull; Grounded in your notes</p>
                        </div>

                        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Live Online
                        </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center sm:px-10">
                                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                    <Sparkles size={30} />
                                </span>

                                <h2 className="mt-6 text-xl font-bold text-gray-900">
                                    What would you like to learn today?
                                </h2>

                                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    Ask questions about your uploaded lecture notes, slides, or complex coursework.
                                </p>

                                <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => handleSend(suggestion)}
                                            className="flex items-start gap-3 rounded-xl border border-stone-200 p-4 text-left text-sm text-gray-700 transition hover:border-teal-300 hover:bg-teal-50"
                                        >
                                            <Lightbulb size={17} className="mt-0.5 shrink-0 text-teal-700" />
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => {
                                    const isUser = msg.role === "user";
                                    return (
                                        <div
                                            key={index}
                                            className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            {!isUser && (
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                                    <Bot size={20} />
                                                </span>
                                            )}

                                            <div
                                                className={`max-w-[85%] rounded-2xl px-5 py-4 sm:max-w-xl ${
                                                    isUser
                                                        ? "bg-teal-700 text-white rounded-tr-none"
                                                        : "bg-stone-50 text-gray-900 border border-stone-200 rounded-tl-none"
                                                }`}
                                            >
                                                <p className="whitespace-pre-line text-sm leading-relaxed">
                                                    {msg.content}
                                                </p>

                                                {/* Citations if available */}
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-3 border-t border-stone-200/80 pt-2">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                                                            Source Reference:
                                                        </p>
                                                        {msg.sources.map((src, i) => (
                                                            <p key={i} className="mt-0.5 text-xs text-gray-600 italic">
                                                                Page {src.page_number}: &quot;{src.excerpt}&quot;
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {isUser && (
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-gray-700">
                                                    <User size={19} />
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}

                                {loading && (
                                    <div className="flex gap-3 items-center text-teal-700">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                            <Bot size={20} />
                                        </span>
                                        <div className="flex items-center gap-2 rounded-2xl bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-gray-600">
                                            <Loader2 size={16} className="animate-spin text-teal-600" />
                                            <span>Searching lecture notes and thinking...</span>
                                        </div>
                                    </div>
                                )}

                                <div ref={chatBottomRef} />
                            </>
                        )}
                    </div>

                    {/* Input form */}
                    <form onSubmit={handleSubmit} className="border-t border-stone-100 p-4 sm:p-5">
                        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-2">
                            <input
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Ask your learning question..."
                                disabled={loading}
                                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-800 disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </div>

                        <p className="mt-2 text-center text-xs text-gray-400">
                            LearnLite AI Tutor &bull; Grounded in university coursework &amp; notes
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
