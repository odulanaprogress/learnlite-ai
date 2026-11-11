
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Frontend demonstration only.
    // Password recovery API will be integrated later.
    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-5 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="mb-12 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <GraduationCap size={23} />
          </span>

          <span className="text-xl font-bold text-gray-900">
            LearnLite<span className="text-teal-600">.</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-7 sm:p-9">

          {!submitted ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Mail size={27} />
              </div>

              <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>

              <p className="mt-3 text-center text-sm leading-6 text-gray-600">
                Dont worry. Enter your email address and
                well help you get back into your account.
              </p>

              <form onSubmit={handleSubmit} className="mt-8">

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-teal-600 px-5 py-4 font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  Continue
                </button>

              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700">
                <CheckCircle2 size={28} />
              </div>

              <h1 className="mt-6 text-2xl font-bold text-gray-900">
                Request received
              </h1>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Your password recovery request has been
                prepared for <strong>{email}</strong>.
                Connect the recovery API to send an actual reset email.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"
            >
              <ArrowLeft size={17} />
              Back to sign in
            </Link>
          </div>

        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} LearnLite AI. All rights reserved.
        </p>

      </div>
    </main>
  );
}