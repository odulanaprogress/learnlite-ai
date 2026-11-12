"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X, LayoutDashboard } from "lucide-react";
import { api, type SafeUser } from "@/lib/api";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "About", href: "#about" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<SafeUser | null>(null);

    useEffect(() => {
        setUser(api.getUser());
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-[#eae7df] bg-[#faf7f2]">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                        <GraduationCap size={23} />
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                        LearnLite<span className="text-teal-600">.</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-teal-700"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-4 md:flex">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800"
                        >
                            <LayoutDashboard size={16} />
                            Go to Dashboard ({user.name.split(" ")[0]})
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-gray-700 hover:text-teal-700"
                            >
                                Sign in
                            </Link>

                            <Link
                                href="/signup"
                                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="border-t border-[#eae7df] px-5 py-5 md:hidden">
                    <div className="flex flex-col gap-5">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-medium text-gray-700"
                            >
                                {link.label}
                            </a>
                        ))}

                        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
                                >
                                    <LayoutDashboard size={16} />
                                    Go to Dashboard ({user.name.split(" ")[0]})
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        Sign in
                                    </Link>

                                    <Link
                                        href="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-xl bg-teal-600 px-5 py-3 text-center text-sm font-semibold text-white"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
