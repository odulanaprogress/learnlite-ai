"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    GraduationCap,
    Eye,
    EyeOff,
    BookOpen,
    ArrowRight,
    Sparkles,
    Loader2,
    Zap,
    CheckCircle2,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api, type SafeUser } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [existingUser, setExistingUser] = useState<SafeUser | null>(null);
    const [rememberEmail, setRememberEmail] = useState(true);

    useEffect(() => {
        const current = api.getUser();
        if (current) {
            setExistingUser(current);
        }

        if (typeof window !== "undefined") {
            const remembered = localStorage.getItem("learnlite_remembered_email");
            if (remembered) {
                setEmail(remembered);
            }
        }
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);
            const res = await api.auth.login({ email: email.trim(), password });
            
            if (typeof window !== "undefined" && rememberEmail) {
                localStorage.setItem("learnlite_remembered_email", email.trim().toLowerCase());
            }

            toast.success(`Welcome back, ${res.user.name}!`);
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to sign in. Please verify your credentials.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGuestLogin() {
        try {
            setGuestLoading(true);
            const res = await api.auth.guest();
            toast.success("Welcome! Instant guest session ready.");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to start guest session.");
        } finally {
            setGuestLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#faf7f2] lg:grid lg:grid-cols-2">

            {/* Left Side - Branding */}
            <section className="relative hidden overflow-hidden bg-[#e5f4ed] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">

                <Link href="/" className="flex w-fit items-center gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700">
                        <GraduationCap size={25} />
                    </span>

                    <span className="text-2xl font-bold text-gray-900">
                        LearnLite<span className="text-teal-600">.</span>
                    </span>
                </Link>

                <div className="relative z-10 max-w-lg">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-700">
                        <Sparkles size={16} />
                        Your smarter learning companion
                    </span>

                    <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-gray-900 xl:text-6xl">
                        Welcome back to a smarter way to learn.
                    </h1>

                    <p className="mt-6 text-lg leading-relaxed text-gray-700">
                        Turn lecture notes into clear summaries, smart flashcards and
                        quizzes in seconds. Built for high performance on low bandwidth.
                    </p>
                </div>

                {/* Bottom decorative stats */}
                <div className="relative z-10 flex items-center gap-6 border-t border-teal-200/50 pt-8">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">100%</p>
                        <p className="text-sm text-gray-600">Offline Study Ready</p>
                    </div>

                    <div className="h-8 w-px bg-teal-200" />

                    <div>
                        <p className="text-2xl font-bold text-gray-900">&lt; 10s</p>
                        <p className="text-sm text-gray-600">AI Note Generation</p>
                    </div>
                </div>

                {/* Background circles */}
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl pointer-events-none" />
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl pointer-events-none" />
            </section>

            {/* Right Side - Form */}
            <section className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-14 xl:px-24">

                <div className="mx-auto w-full max-w-md">

                    {/* Mobile Brand */}
                    <div className="mb-8 lg:hidden">
                        <Link href="/" className="flex w-fit items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                <GraduationCap size={22} />
                            </span>

                            <span className="text-2xl font-bold text-gray-900">
                                LearnLite<span className="text-teal-600">.</span>
                            </span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your credentials to continue to your workspace.
                        </p>
                    </div>

                    {/* Active Session Detected Banner */}
                    {existingUser && (
                        <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/80 p-4.5 shadow-xs">
                            <div className="flex items-center gap-2 text-teal-800">
                                <UserCheck size={18} className="text-teal-600" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Active Student Session
                                </span>
                            </div>
                            <p className="mt-1.5 text-sm font-bold text-gray-900">
                                Welcome back, {existingUser.name}!
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Logged in as {existingUser.email}
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800"
                            >
                                Continue to Dashboard &rarr;
                            </button>
                        </div>
                    )}

                    {/* 1-Click Guest Button */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            disabled={guestLoading || loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-stone-50"
                        >
                            {guestLoading ? (
                                <Loader2 size={18} className="animate-spin text-teal-600" />
                            ) : (
                                <Zap size={18} className="text-amber-500" />
                            )}
                            Instant Campus Guest Mode (No password required)
                        </button>
                    </div>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-stone-200" />
                        <span className="text-xs uppercase text-gray-400">or sign in with email</span>
                        <div className="h-px flex-1 bg-stone-200" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Password
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-teal-700 hover:text-teal-800"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                                >
                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember email toggle */}
                        <div className="flex items-center gap-2.5">
                            <input
                                id="rememberEmail"
                                type="checkbox"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                            <label
                                htmlFor="rememberEmail"
                                className="text-xs text-gray-600 select-none cursor-pointer"
                            >
                                Remember my email on this device
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || guestLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-4 font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold text-teal-700 hover:text-teal-800"
                        >
                            Create an account
                        </Link>
                    </p>

                </div>

            </section>

        </main>
    );
}
