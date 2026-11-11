
import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";

export default function FinalCTA() {
    return (
        <section className="bg-white px-5 py-16 md:py-24">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#dff3ec] px-6 py-14 text-center sm:px-12 md:py-20">

                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-700">
                    <GraduationCap size={30} />
                </span>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-teal-700">
                    <Sparkles size={17} />
                    Your learning journey starts here
                </div>

                <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
                    Ready to make learning
                    <span className="text-teal-700"> easier?</span>
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600">
                    Turn your lecture materials into meaningful learning
                    experiences. Understand more, practise better and
                    learn at your own pace with LearnLite AI.
                </p>

                <Link
                    href="/signup"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-4 font-semibold text-white transition-colors hover:bg-teal-700"
                >
                    Get Started for Free
                    <ArrowRight size={19} />
                </Link>

                <p className="mt-4 text-xs text-gray-500">
                    Your smarter learning experience begins with one step.
                </p>

            </div>
        </section>
    );
}