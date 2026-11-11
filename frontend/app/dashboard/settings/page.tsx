
"use client";

import { useState } from "react";
import Link from "next/link";
import {ArrowLeft,Settings,Globe,BellRing} from "lucide-react";

export default function SettingsPage() {
    const [language, setLanguage] = useState("English");
    const [notifications, setNotifications] = useState(true);

    return (
        <main className="min-h-screen bg-[#faf7f2] p-5 sm:p-8">
            <div className="mx-auto max-w-3xl">

                <Link
                    href="/dashboard"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-teal-700"
                >
                    <ArrowLeft size={17} />
                    Back to dashboard
                </Link>

                <div className="mb-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                        <Settings size={24} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Settings
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Manage your account and learning preferences.
                    </p>
                </div>

                <div className="space-y-5">

                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="font-semibold text-gray-900">
                            Account information
                        </h2>

                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-xs text-gray-400">Full name</p>
                                <p className="mt-1 text-sm font-medium">Student</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Email address</p>
                                <p className="mt-1 text-sm font-medium">
                                    student@example.com
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                            <Globe className="text-teal-700" />
                            <h2 className="font-semibold">Language preference</h2>
                        </div>

                        <select
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-teal-500"
                        >
                            <option>English</option>
                            <option>French</option>
                            <option>Spanish</option>
                        </select>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <BellRing className="text-teal-700" />
                                <div>
                                    <h2 className="font-semibold">Notifications</h2>
                                    <p className="text-xs text-gray-500">
                                        Manage notification preferences.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={notifications}
                                onClick={() => setNotifications(!notifications)}
                                className={`relative h-6 w-11 rounded-full transition ${notifications ? "bg-teal-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${notifications ? "left-6" : "left-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}