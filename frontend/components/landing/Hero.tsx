
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    Brain,
    CheckCircle2,
    FileText,
    Layers,
    Sparkles,
} from "lucide-react";

export default function Hero() {
    return (
        <section className="overflow-hidden bg-[#faf7f2]">
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">

                {/* Left Content */}
                <div className="max-w-xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                        <Sparkles size={16} />
                        Your smarter learning companion
                    </div>

                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                        Turn your lecture notes into{" "}
                        <span className="text-teal-600">
                            smarter learning.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
                        Stop struggling with lengthy lecture materials.
                        Upload your notes and let AI transform them into
                        summaries, flashcards and quizzes that make learning easier.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-4 font-semibold text-white transition-colors hover:bg-teal-700"
                        >
                            Start Learning
                            <ArrowRight size={19} />
                        </Link>

                        <a
                            href="#how-it-works"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-7 py-4 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            See How It Works
                        </a>
                    </div>

                    {/* Supporting text */}
                    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 size={17} className="text-teal-600" />
                            Learn at your own pace
                        </span>

                        <span className="flex items-center gap-2">
                            <CheckCircle2 size={17} className="text-teal-600" />
                            Access saved materials offline
                        </span>
                    </div>
                </div>

                {/* Right Product Preview */}
                <div className="relative mx-auto w-full max-w-lg lg:max-w-none">

                    {/* Background decoration */}
                    <div className="absolute inset-8 rounded-full bg-[#d9f2eb] blur-3xl" />

                    <div className="relative rounded-[2rem] border border-[#e8e3d9] bg-white p-4 shadow-sm sm:p-6">

                        {/* Preview Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                    <BookOpen size={20} />
                                </span>
                                <div>
                                    <p className="font-bold text-gray-900">My Learning Space</p>
                                    <p className="text-xs text-gray-500">Your materials, simplified</p>
                                </div>
                            </div>

                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                Ready to learn
                            </span>
                        </div>

                        {/* Material Card */}
                        <div className="mt-5 rounded-2xl bg-[#faf7f2] p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                <FileText size={16} />
                                Uploaded lecture material
                            </div>

                            <h3 className="mt-3 text-lg font-bold text-gray-900">
                                Introduction to Cell Biology
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Biology 101 · Lecture notes
                            </p>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full w-full rounded-full bg-teal-500" />
                            </div>

                            <p className="mt-2 text-xs text-teal-700">
                                AI processing complete
                            </p>
                        </div>

                        {/* Learning Options */}
                        <div className="mt-5">
                            <h3 className="font-semibold text-gray-900">
                                Explore your material
                            </h3>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                        <FileText size={19} />
                                    </span>
                                    <p className="mt-3 font-semibold text-gray-900">
                                        Summary
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Understand key concepts quickly.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <Layers size={19} />
                                    </span>
                                    <p className="mt-3 font-semibold text-gray-900">
                                        Flashcards
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Remember important concepts.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                        <Brain size={19} />
                                    </span>
                                    <p className="mt-3 font-semibold text-gray-900">
                                        Smart Quiz
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Test your understanding.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
                                        <Sparkles size={19} />
                                    </span>
                                    <p className="mt-3 font-semibold text-gray-900">
                                        AI Tutor
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Ask questions about your notes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Preview */}
                        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#e5f5ef] p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Ready to test yourself?
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                    Your learning journey starts here.
                                </p>
                            </div>

                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
                                <ArrowRight size={20} />
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        A smarter way to understand what you learn.
                    </p>
                </div>
            </div>
        </section>
    );
}