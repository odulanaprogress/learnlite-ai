"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    GraduationCap,
    Eye,
    EyeOff,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [institution, setInstitution] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (
            !fullName.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const res = await api.auth.register({
                name: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                institution: institution.trim() || undefined,
            });

            toast.success(`Welcome to LearnLite, ${res.user.name}!`);
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#faf7f2]">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Left branding section */}
                <section className="hidden flex-col justify-between bg-[#e9f4ef] p-10 lg:flex xl:p-16">
                    <Link href="/" className="flex w-fit items-center gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
                            <GraduationCap size={25} />
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                            LearnLite<span className="text-teal-600">.</span>
                        </span>
                    </Link>

                    <div className="max-w-md">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-teal-800">
                            <Sparkles size={14} />
                            Personalized learning assistant
                        </span>

                        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 xl:text-5xl">
                            Study smarter, retain more and prepare with confidence.
                        </h1>

                        <p className="mt-4 text-base leading-relaxed text-gray-700">
                            Join university students who use LearnLite AI to extract,
                            summarize and study high-yield material in low-bandwidth environments.
                        </p>

                        <ul className="mt-8 space-y-3.5 text-sm text-gray-700">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                                <span>Fast document extraction for lecture notes and slides</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                                <span>Active recall flashcards and custom practice quizzes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                                <span>Grounded AI Tutor to answer questions from your notes</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-xs text-gray-500">
                        &copy; 2026 LearnLite AI. Built for accessibility &amp; offline resilience.
                    </p>
                </section>

                {/* Right form section */}
                <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
                    <div className="w-full max-w-md">

                        <div className="mb-6 lg:hidden">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                                    <GraduationCap size={22} />
                                </span>
                                <span className="text-xl font-bold text-gray-900">
                                    LearnLite<span className="text-teal-600">.</span>
                                </span>
                            </Link>
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                Create an account
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Start generating summaries and flashcards in seconds.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Chisom Okafor"
                                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@university.edu"
                                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            {/* Institution */}
                            <div>
                                <label
                                    htmlFor="institution"
                                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                                >
                                    University / Institution (Optional)
                                </label>
                                <input
                                    id="institution"
                                    type="text"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                    placeholder="e.g. UNILAG, UI, OAU"
                                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                                >
                                    Password
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-teal-700 hover:underline">
                                Sign in
                            </Link>
                        </p>

                    </div>
                </section>

            </div>
        </main>
    );
}
