"use client";

import { useEffect, useState } from "react";
import { api, type StudyPack } from "@/lib/api";
import { getLibraryMaterials } from "@/lib/library";
import { downloadStudyPackFile } from "@/lib/exportStudyPack";
import OfflineStatusBar from "@/components/offline/OfflineStatusBar";
import Link from "next/link";
import {
    ArrowLeft,
    GraduationCap,
    Layers,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Sparkles,
    BookOpen,
    Download,
} from "lucide-react";
import { toast } from "sonner";

const defaultCards = [
    {
        question: "What is the basic unit of life?",
        answer: "The cell is the basic structural and functional unit of all living organisms.",
        category: "Biology",
    },
    {
        question: "What is photosynthesis?",
        answer: "Photosynthesis is the process by which green plants use sunlight, water and carbon dioxide to produce glucose and oxygen.",
        category: "Biology",
    },
    {
        question: "What is DNA?",
        answer: "DNA (Deoxyribonucleic acid) is the molecule that carries the genetic instructions used in the growth, development and functioning of living organisms.",
        category: "Genetics",
    },
    {
        question: "What is an ecosystem?",
        answer: "An ecosystem is a community of living organisms interacting with each other and their physical environment.",
        category: "Ecology",
    },
    {
        question: "What is an enzyme?",
        answer: "An enzyme is a biological catalyst that speeds up chemical reactions without being consumed in the process.",
        category: "Biochemistry",
    },
];

export default function FlashcardsPage() {
    const [cards, setCards] = useState(defaultCards);
    const [isCustom, setIsCustom] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [activePack, setActivePack] = useState<StudyPack | null>(null);

    useEffect(() => {
        const pack = api.getLatestStudyPack();
        if (pack && pack.flashcards && pack.flashcards.length > 0) {
            setActivePack(pack);
            setCards(pack.flashcards.map(c => ({
                question: c.question,
                answer: c.answer,
                category: pack.filename || "Study Notes"
            })));
            setIsCustom(true);
            return;
        }

        getLibraryMaterials().then(materials => {
            const res = materials.find(m => m.resourceType === "Flashcards" && m.textContent);
            if (res && res.textContent) {
                try {
                    const parsed = JSON.parse(res.textContent);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setCards(parsed.map((c: any) => ({
                            question: c.question,
                            answer: c.answer,
                            category: res.name.replace(/ Flashcards.*$/, "") || "Study Notes"
                        })));
                        setIsCustom(true);
                    }
                } catch { }
            }
        }).catch(() => { });
    }, []);

    const currentCard = cards[currentIndex] || cards[0];
    const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

    function goNext() {
        setCurrentIndex((current) => (current + 1) % cards.length);
        setFlipped(false);
    }

    function goPrevious() {
        setCurrentIndex((current) => (current - 1 + cards.length) % cards.length);
        setFlipped(false);
    }

    function resetCards() {
        setCurrentIndex(0);
        setFlipped(false);
        toast.success("Flashcards restarted.");
    }

    function handleDownloadFlashcards() {
        if (activePack) {
            downloadStudyPackFile(activePack, "txt");
            toast.success("Full study pack with flashcards downloaded!");
            return;
        }

        // Export current cards
        const packToExport: StudyPack = {
            id: "cards_" + Date.now(),
            filename: currentCard.category || "Study Notes",
            difficulty: "intermediate",
            summary: "Active recall flashcards saved for offline review on this device.",
            key_concepts: [],
            flashcards: cards.map(c => ({ question: c.question, answer: c.answer, category: c.category })),
            quiz: [],
            createdAt: new Date().toISOString(),
        };

        downloadStudyPackFile(packToExport, "txt");
        toast.success("Flashcards downloaded to your device for offline study!");
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

            <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                            Active Recall &amp; Memory Retention
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Smart Flashcards
                        </h1>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Test your memory and strengthen understanding one card at a time. Works 100% offline.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleDownloadFlashcards}
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-stone-50"
                    >
                        <Download size={16} />
                        Export Cards (.txt)
                    </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <Layers className="text-teal-700" size={20} />
                        <p className="mt-2 text-xl font-bold text-gray-900">{cards.length}</p>
                        <p className="mt-0.5 text-xs text-gray-500">Cards in this set</p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <BookOpen className="text-orange-600" size={20} />
                        <p className="mt-2 text-xl font-bold text-gray-900">{currentIndex + 1} / {cards.length}</p>
                        <p className="mt-0.5 text-xs text-gray-500">Current position</p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <Sparkles className="text-purple-700" size={20} />
                        <p className="mt-2 text-xl font-bold text-gray-900 truncate">{currentCard?.category || "Notes"}</p>
                        <p className="mt-0.5 text-xs text-gray-500">Active subject</p>
                    </div>
                </div>

                <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            Study Session Progress
                        </span>

                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCustom
                                ? "bg-teal-50 text-teal-700 border border-teal-200"
                                : "bg-orange-50 text-orange-700"
                            }`}>
                            {isCustom ? "AI-Generated Active Recall" : "Curated Practice Set"}
                        </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                            className="h-full rounded-full bg-teal-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Card Surface with Flip */}
                    <div
                        onClick={() => setFlipped(!flipped)}
                        className="mt-6 flex min-h-[280px] cursor-pointer select-none flex-col items-center justify-center rounded-2xl border border-teal-100 bg-[#f3f8f5] p-6 text-center transition hover:border-teal-300"
                    >
                        <span className="rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-teal-700 shadow-xs">
                            {currentCard?.category || "Study Material"}
                        </span>

                        <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                            {flipped ? "Answer" : "Question (Click to flip)"}
                        </p>

                        <h2 className="mt-3 max-w-2xl text-lg font-bold leading-relaxed text-gray-900 sm:text-2xl">
                            {flipped ? currentCard?.answer : currentCard?.question}
                        </h2>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFlipped(!flipped);
                            }}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
                        >
                            <RotateCcw size={15} />
                            {flipped ? "Show Question" : "Reveal Answer"}
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm text-gray-500">
                            Card {currentIndex + 1} of {cards.length}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={resetCards}
                                aria-label="Restart flashcards"
                                title="Restart cards"
                                className="rounded-xl border border-stone-200 p-2.5 text-gray-600 transition hover:bg-stone-50"
                            >
                                <RotateCcw size={17} />
                            </button>

                            <button
                                type="button"
                                onClick={goPrevious}
                                aria-label="Previous flashcard"
                                className="rounded-xl border border-stone-200 p-2.5 text-gray-600 transition hover:bg-stone-50"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={goNext}
                                aria-label="Next flashcard"
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-teal-800"
                            >
                                Next Card
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-5 text-center text-[11px] text-gray-400">
                    LearnLite AI &bull; All flashcards stored locally in your browser for 100% offline access
                </p>
            </section>
        </main>
    );
}
