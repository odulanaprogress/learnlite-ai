"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    GraduationCap,
    Send,
    Sparkles,
    Bot,
    Lightbulb,
    User,
    Loader2,
    RotateCcw,
    Download,
    BookOpen,
    CheckCircle2,
    FileText,
} from "lucide-react";
import { toast } from "sonner";
import { api, type TutorSource, type StudyPack } from "@/lib/api";
import { getLibraryMaterials, type LibraryMaterial } from "@/lib/library";
import { answerOfflineQuestion } from "@/lib/offlineTutor";
import OfflineStatusBar from "@/components/offline/OfflineStatusBar";

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: TutorSource[];
    offline?: boolean;
};

const defaultSuggestions = [
    "Explain the core concept in simple terms.",
    "Give me an active recall practice question on this topic.",
    "What are the main definitions I need to remember for my exam?",
    "Summarize the key formulas, mechanisms, or rules discussed.",
];

const CHAT_STORAGE_KEY = "learnlite_tutor_messages_v2";

export default function TutorPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState<LibraryMaterial[]>([]);
    const [latestPack, setLatestPack] = useState<StudyPack | null>(null);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>("all");
    const [isOnline, setIsOnline] = useState(true);

    const chatBottomRef = useRef<HTMLDivElement>(null);

    // 1. Initial load: restore saved chat, load materials & latest study pack
    useEffect(() => {
        setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Load latest pack
        const pack = api.getLatestStudyPack();
        setLatestPack(pack);

        // Load IndexedDB materials
        getLibraryMaterials()
            .then((items) => {
                setMaterials(items);
            })
            .catch(() => {});

        // Restore chat messages
        try {
            const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
            if (savedChat) {
                const parsed = JSON.parse(savedChat);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            }
        } catch {}

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // 2. Persist chat messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
            } catch {}
        }
    }, [messages]);

    // 3. Auto-scroll on new message
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Active material title
    const activeMaterialName =
        selectedMaterialId === "all"
            ? (latestPack?.filename ? `${latestPack.filename} (+ saved library)` : "All Saved Notes")
            : (materials.find((m) => m.id === selectedMaterialId)?.name || "Selected Note");

    // Clear chat
    function handleClearChat() {
        if (messages.length === 0) return;
        if (window.confirm("Do you want to clear your conversation history?")) {
            setMessages([]);
            localStorage.removeItem(CHAT_STORAGE_KEY);
            toast.success("Chat history cleared.");
        }
    }

    // Export chat to local text file
    function handleExportChat() {
        if (messages.length === 0) {
            toast.error("No conversation to export yet.");
            return;
        }

        let content = `====================================================\n`;
        content += `LEARNLITE AI — TUTOR CONVERSATION EXPORT\n`;
        content += `Topic: ${activeMaterialName}\n`;
        content += `Date: ${new Date().toLocaleString()}\n`;
        content += `====================================================\n\n`;

        messages.forEach((msg, idx) => {
            const sender = msg.role === "user" ? "STUDENT" : "LEARNLITE AI TUTOR";
            content += `[${idx + 1}] ${sender}:\n${msg.content}\n`;
            if (msg.sources && msg.sources.length > 0) {
                content += `Sources Cited:\n`;
                msg.sources.forEach((s) => {
                    content += `  - Page ${s.page_number}: "${s.excerpt}"\n`;
                });
            }
            content += `\n----------------------------------------------------\n\n`;
        });

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `LearnLite_Tutor_Session_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Tutor session exported to your device!");
    }

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

        // Offline check
        const offline = !navigator.onLine;

        if (offline) {
            // Instant offline grounded response from local IndexedDB & study pack
            const offlineResponse = answerOfflineQuestion(query, latestPack, materials);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: offlineResponse.answer,
                    sources: offlineResponse.sources,
                    offline: true,
                },
            ]);
            setLoading(false);
            return;
        }

        try {
            // Build grounded pages
            const packPages: { page_number: number; text: string }[] = [];

            if (latestPack?.summary) {
                packPages.push({
                    page_number: 1,
                    text: `Topic & Summary (${latestPack.filename || "Notes"}): ${latestPack.summary}`,
                });
            }

            if (latestPack?.key_concepts && latestPack.key_concepts.length > 0) {
                packPages.push({
                    page_number: 2,
                    text:
                        `Key Concepts & Definitions:\n` +
                        latestPack.key_concepts.map((k) => `- ${k.term}: ${k.definition}`).join("\n"),
                });
            }

            // If specific material selected, filter to that material
            const filteredMaterials =
                selectedMaterialId === "all"
                    ? materials
                    : materials.filter((m) => m.id === selectedMaterialId);

            const libraryPages = filteredMaterials.flatMap((m, idx) => {
                const content = m.textContent?.trim();
                if (!content) return [];
                return [{ page_number: packPages.length + idx + 1, text: `${m.name}:\n${content.slice(0, 3500)}` }];
            });

            const combinedPages = [...packPages, ...libraryPages];
            const pagesToPass =
                combinedPages.length > 0
                    ? combinedPages
                    : [
                          {
                              page_number: 1,
                              text: "University coursework across sciences, humanities, engineering, business, and general academic curriculum. Foundational definitions, concepts, and exam prep principles.",
                          },
                      ];

            const response = await api.tutor.ask({
                question: query,
                pages: pagesToPass,
                filename: latestPack?.filename || filteredMaterials[0]?.name || "University Study Notes",
                history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.answer,
                    sources: response.sources,
                    offline: false,
                },
            ]);
        } catch (err: any) {
            // Network fallback to offline grounded response
            console.warn("Tutor network error, falling back to local offline search:", err);
            const offlineResponse = answerOfflineQuestion(query, latestPack, materials);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: offlineResponse.answer,
                    sources: offlineResponse.sources,
                    offline: true,
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
            {/* Top Navigation */}
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"
                    >
                        <ArrowLeft size={18} />
                        Dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        <OfflineStatusBar />

                        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                <GraduationCap size={21} />
                            </span>
                            <span className="hidden sm:inline">LearnLite</span>
                        </Link>
                    </div>
                </div>
            </header>

            <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
                {/* Heading & Material Selector */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                            Academic Pairing Assistant
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                            AI Study Tutor
                        </h1>
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Ask questions, test recall, and clarify difficult concepts grounded in your lecture notes.
                        </p>
                    </div>

                    {/* Material Selector & Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {materials.length > 0 && (
                            <div className="relative">
                                <select
                                    value={selectedMaterialId}
                                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                                    aria-label="Select study note to ground questions"
                                    className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm outline-none transition focus:border-teal-500"
                                >
                                    <option value="all">📚 All Notes &amp; Packs</option>
                                    {latestPack && (
                                        <option value="latest">✨ {latestPack.filename || "Latest Study Pack"}</option>
                                    )}
                                    {materials.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            📄 {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleExportChat}
                            title="Export chat as study notes"
                            disabled={messages.length === 0}
                            className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-40"
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Export</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleClearChat}
                            title="Start fresh conversation"
                            disabled={messages.length === 0}
                            className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-40"
                        >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                    {/* Assistant Status Subheader */}
                    <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 bg-stone-50/70">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                                <Bot size={18} />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                                    LearnLite Academic Tutor
                                </h2>
                                <p className="text-[11px] text-gray-500">
                                    Active context: <span className="font-medium text-teal-800">{activeMaterialName}</span>
                                </p>
                            </div>
                        </div>

                        <span className="text-[11px] font-medium text-gray-400">
                            {messages.length} {messages.length === 1 ? "turn" : "turns"}
                        </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center sm:px-10">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                    <Sparkles size={28} />
                                </span>

                                <h2 className="mt-4 text-lg font-bold text-gray-900 sm:text-xl">
                                    Ready to study {latestPack?.filename ? `"${latestPack.filename}"` : "your notes"}?
                                </h2>

                                <p className="mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                                    Ask questions, request summaries, or test yourself on key definitions. Your tutor uses your saved materials to give exact answers.
                                </p>

                                <div className="mt-6 grid w-full max-w-xl gap-2.5 sm:grid-cols-2">
                                    {defaultSuggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => handleSend(suggestion)}
                                            className="flex items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-left text-xs text-gray-700 transition hover:border-teal-300 hover:bg-teal-50"
                                        >
                                            <Lightbulb size={15} className="mt-0.5 shrink-0 text-teal-700" />
                                            <span>{suggestion}</span>
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
                                            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            {!isUser && (
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                                    <Bot size={18} />
                                                </span>
                                            )}

                                            <div
                                                className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-xl sm:px-5 sm:py-4 ${
                                                    isUser
                                                        ? "bg-teal-700 text-white rounded-tr-none"
                                                        : "bg-stone-50 text-gray-900 border border-stone-200 rounded-tl-none"
                                                }`}
                                            >
                                                {/* Offline badge tag if answered offline */}
                                                {!isUser && msg.offline && (
                                                    <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                                        <span>📱 Offline Local Engine</span>
                                                    </div>
                                                )}

                                                <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                                                    {msg.content}
                                                </div>

                                                {/* Citations if available */}
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-3 border-t border-stone-200/80 pt-2.5">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                                                            Source Grounding:
                                                        </p>
                                                        {msg.sources.map((src, i) => (
                                                            <div key={i} className="mt-1 rounded-lg bg-white/80 p-2 text-[11px] text-gray-600 border border-stone-200/50">
                                                                {src.excerpt.includes("Web Knowledge") || src.excerpt.includes("Wikipedia") || src.excerpt.includes("DuckDuckGo") ? (
                                                                    <span className="font-bold text-blue-700">🌐 Web Reference: </span>
                                                                ) : (
                                                                    <span className="font-semibold text-teal-700">Page {src.page_number}: </span>
                                                                )}
                                                                &quot;{src.excerpt}&quot;
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {isUser && (
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-gray-700">
                                                    <User size={17} />
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}

                                {loading && (
                                    <div className="flex gap-3 items-center text-teal-700">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                            <Bot size={18} />
                                        </span>
                                        <div className="flex items-center gap-2 rounded-2xl bg-stone-50 border border-stone-200 px-4 py-2.5 text-xs text-gray-600">
                                            <Loader2 size={14} className="animate-spin text-teal-600" />
                                            <span>
                                                {isOnline
                                                    ? "Consulting your notes and generating answer..."
                                                    : "Searching local offline materials on your device..."}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div ref={chatBottomRef} />
                            </>
                        )}
                    </div>

                    {/* Quick follow-up chips when chatting */}
                    {messages.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto border-t border-stone-100 px-4 py-2 bg-stone-50/50">
                            <button
                                type="button"
                                onClick={() => handleSend("Give me a quick practice quiz question on this.")}
                                className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 transition hover:border-teal-400 hover:text-teal-700"
                            >
                                🎯 Test me with a question
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSend("Can you explain this simpler with an analogy?")}
                                className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 transition hover:border-teal-400 hover:text-teal-700"
                            >
                                💡 Explain simpler
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSend("What are the 3 most important points for an exam?")}
                                className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 transition hover:border-teal-400 hover:text-teal-700"
                            >
                                📝 Top 3 exam points
                            </button>
                        </div>
                    )}

                    {/* Input form */}
                    <form onSubmit={handleSubmit} className="border-t border-stone-100 p-3 sm:p-4">
                        <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-1.5 sm:p-2">
                            <input
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Ask anything about your lecture notes..."
                                disabled={loading}
                                className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                aria-label="Send message"
                                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-800 disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </div>

                        <p className="mt-2 text-center text-[10px] text-gray-400">
                            LearnLite AI Tutor &bull; All conversations saved locally on your device for offline study
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
