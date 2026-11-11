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
} from "lucide-react";
import { api } from "@/lib/api";
import { getLibraryMaterials } from "@/lib/library";

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

    useEffect(() => {
        const pack = api.getLatestStudyPack();
        if (pack && pack.quiz && pack.quiz.length > 0) {
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
    const progress = ((currentIndex + 1) / questions.length) * 100;

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
            return;
        }

        setSubmitted(true);
    }

    function restartQuiz() {
        setCurrentIndex(0);
        setSelectedAnswers({});
        setSubmitted(false);
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

            <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                                Practice Quizzes
                            </p>
                            {isCustom && (
                                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                                    AI-Generated
                                </span>
                            )}
                        </div>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Test Your Understanding
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 border border-stone-200">
                        <ClipboardList size={18} className="text-teal-700" />
                        <span className="text-sm font-semibold text-gray-700">
                            {currentIndex + 1} of {questions.length}
                        </span>
                    </div>
                </div>

                <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                        className="h-full bg-teal-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {!submitted ? (
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {currentQuestion?.question}
                        </h2>

                        <div className="mt-6 space-y-3">
                            {currentQuestion?.options.map((option, index) => {
                                const selected = selectedAnswer === index;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => selectAnswer(index)}
                                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                                            selected
                                                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                                                : "border-stone-200 hover:border-teal-200 hover:bg-stone-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                                    selected
                                                        ? "bg-teal-700 text-white"
                                                        : "bg-stone-100 text-gray-600"
                                                }`}
                                            >
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {option}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6">
                            <button
                                type="button"
                                onClick={goPrevious}
                                disabled={currentIndex === 0}
                                className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-stone-50 disabled:opacity-40"
                            >
                                Previous
                            </button>

                            {currentIndex < questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={selectedAnswer === undefined}
                                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight size={17} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={Object.keys(selectedAnswers).length !== questions.length}
                                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                                >
                                    Submit Quiz
                                    <Sparkles size={17} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                            <Trophy size={32} />
                        </span>

                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Quiz Completed!
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            You scored {score} out of {questions.length} questions correctly.
                        </p>

                        <div className="mt-8 space-y-4 text-left">
                            {questions.map((q, idx) => {
                                const isCorrect = selectedAnswers[idx] === q.answer;
                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-2xl border p-4 ${
                                            isCorrect
                                                ? "border-green-200 bg-green-50/50"
                                                : "border-red-200 bg-red-50/50"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            {isCorrect ? (
                                                <CheckCircle2 size={18} className="mt-0.5 text-green-600 shrink-0" />
                                            ) : (
                                                <XCircle size={18} className="mt-0.5 text-red-600 shrink-0" />
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {idx + 1}. {q.question}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-600">
                                                    Your answer: <span className="font-medium">{q.options[selectedAnswers[idx]]}</span>
                                                </p>
                                                {!isCorrect && (
                                                    <p className="mt-0.5 text-xs text-green-700 font-medium">
                                                        Correct answer: {q.options[q.answer]}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-500 italic">
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={restartQuiz}
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                        >
                            <RotateCcw size={17} />
                            Retry Quiz
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
