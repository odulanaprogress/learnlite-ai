
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getLibraryMaterials } from "@/lib/library";
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

    useEffect(() => {
        const pack = api.getLatestStudyPack();
        if (pack && pack.flashcards && pack.flashcards.length > 0) {
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
                } catch {}
            }
        }).catch(() => {});
    }, []);
    const [flipped, setFlipped] = useState(false);

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

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

            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                        Study and revise
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Smart Flashcards
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Test your memory and strengthen your understanding one card at a time.
                    </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 bg-white p-5">
                        <Layers className="text-teal-700" size={22} />
                        <p className="mt-3 text-2xl font-bold text-gray-900">{cards.length}</p>
                        <p className="mt-1 text-xs text-gray-500">Demo cards</p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-5">
                        <BookOpen className="text-orange-600" size={22} />
                        <p className="mt-3 text-2xl font-bold text-gray-900">{currentIndex + 1}</p>
                        <p className="mt-1 text-xs text-gray-500">Current card</p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-5">
                        <Sparkles className="text-purple-700" size={22} />
                        <p className="mt-3 text-2xl font-bold text-gray-900">{currentCard.category}</p>
                        <p className="mt-1 text-xs text-gray-500">Current topic</p>
                    </div>
                </div>

                <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-gray-700">
                            Your study session
                        </span>

                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                            Demo cards
                        </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                            className="h-full rounded-full bg-teal-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-teal-100 bg-[#f3f8f5] p-8 text-center">
                        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal-700">
                            {currentCard.category}
                        </span>

                        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            {flipped ? "Answer" : "Question"}
                        </p>

                        <h2 className="mt-4 max-w-2xl text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl">
                            {flipped ? currentCard.answer : currentCard.question}
                        </h2>

                        <button
                            type="button"
                            onClick={() => setFlipped(!flipped)}
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
                        >
                            <RotateCcw size={17} />
                            {flipped ? "Show question" : "Reveal answer"}
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            Card {currentIndex + 1} of {cards.length}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={resetCards}
                                aria-label="Restart flashcards"
                                className="rounded-xl border border-stone-200 p-3 text-gray-600 transition hover:bg-stone-50"
                            >
                                <RotateCcw size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={goPrevious}
                                aria-label="Previous flashcard"
                                className="rounded-xl border border-stone-200 p-3 text-gray-600 transition hover:bg-stone-50"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                type="button"
                                onClick={goNext}
                                aria-label="Next flashcard"
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                            >
                                Next card
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-5 text-center text-xs text-gray-400">
                    These are sample flashcards. AI-generated study cards will be connected through the backend.
                </p>
            </section>
        </main>
    );
}