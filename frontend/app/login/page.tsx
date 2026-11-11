
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Eye,
  EyeOff,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Frontend validation for now.
    // Authentication API will be connected later.
    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    alert("Login form is ready for backend integration.");
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

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your lecture notes, summaries and learning
            resources are waiting for you. Pick up where
            you left off.
          </p>

          <div className="mt-10 rounded-2xl border border-white bg-white/80 p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-teal-700" size={24} />
              <p className="font-semibold text-gray-900">
                Learn at your own pace
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Understand difficult topics, practise with
              flashcards and build confidence in your studies.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Learn smarter, not harder.
        </p>
      </section>

      {/* Right Side - Login Form */}
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <Link href="/" className="mb-12 flex items-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <GraduationCap size={23} />
            </span>

            <span className="text-xl font-bold text-gray-900">
              LearnLite<span className="text-teal-600">.</span>
            </span>
          </Link>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back!
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Sign in to continue your learning journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-6">

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

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-4 font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Sign In
              <ArrowRight size={18} />
            </button>

          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Dont have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-12 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} LearnLite AI. All rights reserved.
          </p>

        </div>
      </section>
    </main>
  );
}