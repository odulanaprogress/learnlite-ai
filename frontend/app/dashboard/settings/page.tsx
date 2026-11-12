"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Globe, BellRing, User, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, type SafeUser } from "@/lib/api";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<SafeUser | null>(null);
    const [language, setLanguage] = useState("English");
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        const u = api.getUser();
        setUser(u);
    }, []);

    function handleLogout() {
        if (window.confirm("Are you sure you want to sign out?")) {
            api.auth.logout();
            toast.success("Signed out successfully.");
            router.push("/login");
        }
    }

    function handleLanguageChange(val: string) {
        setLanguage(val);
        toast.success(`Language updated to ${val}`);
    }

    function handleToggleNotifications() {
        setNotifications(!notifications);
        toast.success(notifications ? "Notifications disabled." : "Notifications enabled.");
    }

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
                        Manage your account, preferences, and offline session.
                    </p>
                </div>

                <div className="space-y-5">

                    {/* Account Info */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                    <User size={18} />
                                </span>
                                <h2 className="font-semibold text-gray-900">
                                    Account information
                                </h2>
                            </div>

                            {user?.isGuest && (
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                    Guest Session
                                </span>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl bg-stone-50 p-3.5">
                                <p className="text-xs font-medium text-gray-500">Full name</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {user?.name || "Student"}
                                </p>
                            </div>

                            <div className="rounded-xl bg-stone-50 p-3.5">
                                <p className="text-xs font-medium text-gray-500">Email address</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900 truncate">
                                    {user?.email || "student@learnlite.local"}
                                </p>
                            </div>

                            {user?.institution && (
                                <div className="rounded-xl bg-stone-50 p-3.5 sm:col-span-2">
                                    <p className="text-xs font-medium text-gray-500">University / Institution</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {user.institution}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Language Preference */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                            <Globe className="text-teal-700" size={20} />
                            <h2 className="font-semibold text-gray-900">Language preference</h2>
                        </div>

                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-teal-500 bg-white"
                        >
                            <option>English</option>
                            <option>French</option>
                            <option>Spanish</option>
                            <option>Yoruba</option>
                            <option>Hausa</option>
                            <option>Igbo</option>
                        </select>
                    </section>

                    {/* Notifications */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <BellRing className="text-teal-700" size={20} />
                                <div>
                                    <h2 className="font-semibold text-gray-900">Study Reminders</h2>
                                    <p className="text-xs text-gray-500">
                                        Active spaced repetition flashcard review notifications.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={notifications}
                                onClick={handleToggleNotifications}
                                className={`relative h-6 w-11 rounded-full transition ${notifications ? "bg-teal-600" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${notifications ? "left-6" : "left-1"}`}
                                />
                            </button>
                        </div>
                    </section>

                    {/* Security & Session */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-teal-700" size={20} />
                                <div>
                                    <h2 className="font-semibold text-gray-900">Session Security</h2>
                                    <p className="text-xs text-gray-500">
                                        Offline storage secured via browser IndexedDB &amp; JWT.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                            >
                                <LogOut size={15} />
                                Sign Out
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}
