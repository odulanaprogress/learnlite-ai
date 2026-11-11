
"use client";

import { useState } from "react";
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

const questions = [
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);

    const currentQuestion = questions[currentIndex];
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

            <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                        Test your knowledge
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Practice Quizzes
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Challenge yourself and find out how much you have learned.
                    </p>
                </div>

                {!submitted ? (
                    <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList size={20} className="text-teal-700" />
                                <span className="text-sm font-semibold text-gray-800">
                                    Biology practice
                                </span>
                            </div>

                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                                Demo quiz
                            </span>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
                            <div
                                className="h-full rounded-full bg-teal-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="mt-3 flex justify-between text-xs text-gray-500">
                            <span>Question {currentIndex + 1} of {questions.length}</span>
                            <span>{Math.round(progress)}% completed</span>
                        </div>

                        <h2 className="mt-8 text-xl font-bold leading-relaxed text-gray-900">
                            {currentQuestion.question}
                        </h2>

                        <div className="mt-6 space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => selectAnswer(index)}
                                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${
                                            isSelected
                                                ? "border-teal-600 bg-teal-50 text-teal-900"
                                                : "border-stone-200 text-gray-700 hover:border-teal-300 hover:bg-stone-50"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                isSelected
                                                    ? "bg-teal-700 text-white"
                                                    : "bg-stone-100 text-gray-600"
                                            }`}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </span>

                                        <span className="font-medium">{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
                            <button
                                type="button"
                                onClick={goPrevious}
                                disabled={currentIndex === 0}
                                className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            {currentIndex === questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={Object.keys(selectedAnswers).length !== questions.length}
                                    className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Submit quiz
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={selectedAnswer === undefined}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next question
                                    <ChevronRight size={17} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
                        <div className="text-center">
                            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                                <Trophy size={32} />
                            </span>

                            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-teal-700">
                                Quiz completed
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                Your result
                            </h2>

                            <p className="mt-5 text-5xl font-bold text-teal-700">
                                {score}/{questions.length}
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                You scored {Math.round((score / questions.length) * 100)}%.
                            </p>
                        </div>

                        <div className="mt-8 space-y-5">
                            {questions.map((question, index) => {
                                const correct =
                                    selectedAnswers[index] === question.answer;

                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-stone-200 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            {correct ? (
                                                <CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={19} />
                                            ) : (
                                                <XCircle className="mt-0.5 shrink-0 text-red-500" size={19} />
                                            )}

                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {index + 1}. {question.question}
                                                </p>

                                                <p className="mt-2 text-xs text-gray-500">
                                                    Your answer: {question.options[selectedAnswers[index]]}
                                                </p>

                                                {!correct && (
                                                    <p className="mt-1 text-xs font-medium text-teal-700">
                                                        Correct answer: {question.options[question.answer]}
                                                    </p>
                                                )}

                                                <p className="mt-3 text-sm leading-6 text-gray-600">
                                                    {question.explanation}
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
                            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                        >
                            <RotateCcw size={17} />
                            Try again
                        </button>
                    </div>
                )}

                <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
                    <Sparkles size={14} />
                    Sample quiz for demonstration. AI quiz generation will be connected later.
                </p>
            </section>
        </main>
    );
}