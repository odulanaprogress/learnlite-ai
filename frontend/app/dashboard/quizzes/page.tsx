"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    GraduationCap,
    ClipboardList,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ChevronRight,
    Trophy,
    Sparkles,
    Download,
} from "lucide-react";
import { api, type StudyPack } from "@/lib/api";
import { getLibraryMaterials } from "@/lib/library";
import { downloadStudyPackFile } from "@/lib/exportStudyPack";
import OfflineStatusBar from "@/components/offline/OfflineStatusBar";
import { toast } from "sonner";

type QuizItem = {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
};

const defaultQuestions: QuizItem[] = [
    {
        question: "Which organelle is known as the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondrion", "Ribosome", "Golgi apparatus"],
        answer: 1,
        explanation: "Mitochondria produce most of the energy used by the cell through cellular respiration.",
    },
    {
        question: "What is the main function of DNA?",
        options: [
            "Energy production",
            "Protein digestion",
            "Storing genetic information",
            "Transporting oxygen",
        ],
        answer: 2,
        explanation: "DNA stores the genetic instructions that guide the development and functioning of living organisms.",
    },
    {
        question: "Which process allows plants to produce glucose?",
        options: [
            "Respiration",
            "Photosynthesis",
            "Fermentation",
            "Transpiration",
        ],
        answer: 1,
        explanation: "Photosynthesis uses light energy to convert water and carbon dioxide into glucose and oxygen.",
    },
    {
        question: "What is the basic unit of heredity?",
        options: ["Cell", "Tissue", "Gene", "Organ"],
        answer: 2,
        explanation: "A gene is a unit of heredity that contains information influencing inherited characteristics.",
    },
    {
        question: "Which of these is a prokaryotic organism?",
        options: ["Human", "Mushroom", "Bacterium", "Oak tree"],
        answer: 2,
        explanation: "Bacteria are prokaryotes because they lack a membrane-bound nucleus.",
    },
];

export default function QuizzesPage() {
    const [questions, setQuestions] = useState<QuizItem[]>(defaultQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [activePack, setActivePack] = useState<StudyPack | null>(null);

    useEffect(() => {
        const pack = api.getLatestStudyPack();
        if (pack && pack.quiz && pack.quiz.length > 0) {
            setActivePack(pack);
            setQuestions(
                pack.quiz.map((q) => ({
                    question: q.question,
                    options: q.options,
                    answer: q.correct_answer_index,
                    explanation: q.explanation,
                }))
            );
            setIsCustom(true);
            return;
        }

        getLibraryMaterials()
            .then((materials) => {
                const res = materials.find((m) => m.resourceType === "Quiz" && m.textContent);
                if (res && res.textContent) {
                    try {
                        const parsed = JSON.parse(res.textContent);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setQuestions(
                                parsed.map((q: any) => ({
                                    question: q.question,
                                    options: q.options,
                                    answer: q.correct_answer_index ?? q.answer ?? 0,
                                    explanation: q.explanation || "Correct answer.",
                                }))
                            );
                            setIsCustom(true);
                        }
                    } catch {}
                }
            })
            .catch(() => {});
    }, []);

    const currentQuestion = questions[currentIndex] || questions[0];
    const selectedAnswer = selectedAnswers[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    const score = questions.reduce((total, question, index) => {
        return total + (selectedAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    function selectAnswer(optionIndex: number) {
        if (submitted) return;

        setSelectedAnswers((previous) => ({
            ...previous,
            [currentIndex]: optionIndex,
        }));
    }

    function goNext() {
        if (selectedAnswer === undefined) return;

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((previous) => previous + 1);
        }
    }

    function goPrevious() {
        if (currentIndex > 0) {
            setCurrentIndex((previous) => previous - 1);
        }
    }

    function handleSubmit() {
        if (Object.keys(selectedAnswers).length !== questions.length) {
            toast.error("Please answer all questions before submitting.");
            return;
        }

        setSubmitted(true);
    }

    function restartQuiz() {
        setCurrentIndex(0);
        setSelectedAnswers({});
        setSubmitted(false);
    }

    function handleDownloadQuiz() {
        if (activePack) {
            downloadStudyPackFile(activePack, "txt");
            toast.success("Full study pack with practice quiz downloaded!");
            return;
        }

        const packToExport: StudyPack = {
            id: "quiz_" + Date.now(),
            filename: "Practice Quiz",
            difficulty: "intermediate",
            summary: "Practice exam questions saved for offline study on this device.",
            key_concepts: [],
            flashcards: [],
            quiz: questions.map((q) => ({
                question: q.question,
                options: q.options,
                correct_answer_index: q.answer,
                explanation: q.explanation,
            })),
            createdAt: new Date().toISOString(),
        };

        downloadStudyPackFile(packToExport, "txt");
        toast.success("Practice quiz downloaded to your device for offline study!");
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

            <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                            Exam Prep &amp; Knowledge Check
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Practice Quizzes
                        </h1>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Evaluate your mastery with exam-style questions. Works 100% offline.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleDownloadQuiz}
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-stone-50"
                    >
                        <Download size={16} />
                        Export Quiz (.txt)
                    </button>
                </div>

                <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8 shadow-sm">
                    {submitted ? (
                        /* Results screen */
                        <div className="text-center py-6">
                            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                <Trophy size={32} />
                            </span>

                            <h2 className="mt-5 text-2xl font-bold text-gray-900">
                                Quiz Completed!
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                You scored <span className="font-bold text-teal-700">{score}</span> out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
                            </p>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={restartQuiz}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                                >
                                    <RotateCcw size={17} />
                                    Retake Quiz
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadQuiz}
                                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-stone-50"
                                >
                                    <Download size={17} />
                                    Download Questions &amp; Answers
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Question screen */
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>

                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isCustom
                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                        : "bg-teal-50 text-teal-700"
                                }`}>
                                    {isCustom ? "AI-Generated Assessment" : "Standard Practice"}
                                </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
                                <div
                                    className="h-full rounded-full bg-teal-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <h2 className="mt-6 text-base sm:text-lg font-bold leading-relaxed text-gray-900">
                                {currentQuestion?.question}
                            </h2>

                            <div className="mt-5 space-y-2.5">
                                {currentQuestion?.options.map((option, index) => {
                                    const isSelected = selectedAnswer === index;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => selectAnswer(index)}
                                            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-xs sm:text-sm transition ${
                                                isSelected
                                                    ? "border-teal-600 bg-teal-50 text-teal-900 font-medium"
                                                    : "border-stone-200 bg-stone-50/50 text-gray-800 hover:border-teal-200 hover:bg-teal-50/30"
                                            }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                                    isSelected
                                                        ? "bg-teal-700 text-white"
                                                        : "bg-stone-200 text-gray-700"
                                                }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span>{option}</span>
                                            </span>

                                            {isSelected && <CheckCircle2 size={18} className="text-teal-700 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-100 pt-5">
                                <button
                                    type="button"
                                    onClick={goPrevious}
                                    disabled={currentIndex === 0}
                                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:bg-stone-50 disabled:opacity-30"
                                >
                                    Previous
                                </button>

                                {currentIndex === questions.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={selectedAnswer === undefined}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-40"
                                    >
                                        Submit Answers
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        disabled={selectedAnswer === undefined}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-40"
                                    >
                                        Next Question
                                        <ChevronRight size={17} />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <p className="mt-5 text-center text-[11px] text-gray-400">
                    LearnLite AI &bull; All practice quizzes and answer keys stored locally on this device
                </p>
            </section>
        </main>
    );
}
