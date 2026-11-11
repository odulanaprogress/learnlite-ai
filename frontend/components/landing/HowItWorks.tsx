
import {
    UploadCloud,
    BrainCircuit,
    BookOpen,
    ArrowRight,
    FileText,
    Sparkles,
    Layers,
    Brain,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: UploadCloud,
        title: "Upload your materials",
        description:
            "Upload lecture documents, take photos of handwritten notes, or simply paste your study materials.",
        color: "bg-teal-50 text-teal-700",
    },
    {
        number: "02",
        icon: BrainCircuit,
        title: "Let AI do the work",
        description:
            "LearnLite analyses your materials and transforms the content into easier learning resources.",
        color: "bg-orange-50 text-orange-600",
    },
    {
        number: "03",
        icon: BookOpen,
        title: "Learn your way",
        description:
            "Explore summaries, practise with flashcards and quizzes, or ask the AI tutor questions.",
        color: "bg-green-50 text-green-700",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="bg-[#faf7f2] py-20 md:py-28"
        >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">

                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                        How it works
                    </span>

                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Learning made simple.
                        <span className="text-teal-600">
                            {" "}Every step of the way.
                        </span>
                    </h2>

                    <p className="mt-5 text-base leading-7 text-gray-600 sm:text-lg">
                        No complicated process. Just bring your lecture
                        materials and let LearnLite help you understand them better.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-6">

                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <article
                                key={step.number}
                                className="relative rounded-2xl border border-[#eae5dc] bg-white p-7"
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
                                    >
                                        <Icon size={27} />
                                    </div>

                                    <span className="text-4xl font-bold text-gray-100">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="mt-7 text-xl font-bold text-gray-900">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-gray-600">
                                    {step.description}
                                </p>

                                {index < 2 && (
                                    <div className="mt-6 hidden items-center text-teal-600 md:flex">
                                        <span className="text-xs font-semibold">
                                            STEP {index + 1}
                                        </span>
                                        <ArrowRight size={16} className="ml-2" />
                                    </div>
                                )}
                            </article>
                        );
                    })}

                </div>

                {/* Learning output preview */}
                <div className="mt-12 rounded-2xl border border-[#eae5dc] bg-white p-6 sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-md">
                            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                                <Sparkles size={17} />
                                Your learning workspace
                            </div>

                            <h3 className="mt-3 text-2xl font-bold text-gray-900">
                                One lecture. Multiple ways to learn.
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-gray-600">
                                Get different learning experiences from the
                                same lecture material, making it easier to
                                understand and remember what you study.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: FileText, label: "Summaries" },
                                { icon: Layers, label: "Flashcards" },
                                { icon: Brain, label: "Quizzes" },
                                { icon: Sparkles, label: "AI Tutor" },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex min-w-0 flex-col items-center gap-3 rounded-xl bg-[#faf7f2] p-4"
                                    >
                                        <Icon size={23} className="text-teal-700" />
                                        <span className="text-xs font-semibold text-gray-700">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}