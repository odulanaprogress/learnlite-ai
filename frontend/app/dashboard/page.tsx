
"use client";

import { useEffect, useState } from "react";
import { api, type SafeUser } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    MessageCircle,
    Layers,
    ClipboardList,
    Settings,
    HelpCircle,
    Bell,
    Search,
    Menu,
    X,
    FileText,
    Plus,
    ArrowUpRight,
    Clock3,
    GraduationCap,
    Sparkles,
    ChevronRight,
} from "lucide-react";

import IngestPicker from "@/components/ingest/IngestPicker";
import OfflineStatusBar from "@/components/offline/OfflineStatusBar";
import { downloadStudyPackFile } from "@/lib/exportStudyPack";
import { Download } from "lucide-react";
import UserProfile from "@/components/dashboard/UserProfile";
import { getLibraryMaterials, type LibraryMaterial } from "@/lib/library";

const navigation = [
    { label: "Overview", href: "/dashboard", Icon: LayoutDashboard },
    { label: "My Library", href: "/dashboard/library", Icon: BookOpen },
    { label: "AI Tutor", href: "/dashboard/tutor", Icon: MessageCircle },
    { label: "Flashcards", href: "/dashboard/flashcards", Icon: Layers },
    { label: "Quizzes", href: "/dashboard/quizzes", Icon: ClipboardList },
];

const learningTools = [
    {
        title: "AI Summaries",
        description: "Turn long lecture notes into clear, simple summaries.",
        Icon: FileText,
        color: "bg-teal-50 text-teal-700",
        href: "/dashboard/library",
    },
    {
        title: "Smart Flashcards",
        description: "Remember important concepts with study cards.",
        Icon: Layers,
        color: "bg-orange-50 text-orange-600",
        href: "/dashboard/flashcards",
    },
    {
        title: "Practice Quizzes",
        description: "Test your understanding with practice questions.",
        Icon: ClipboardList,
        color: "bg-purple-50 text-purple-700",
        href: "/dashboard/quizzes",
    },
];

export default function DashboardPage() {
    const router = useRouter();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<SafeUser | null>(null);
    const [recentMaterials, setRecentMaterials] = useState<LibraryMaterial[]>([]);
    const [stats, setStats] = useState({
        materialsCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
    });

    useEffect(() => {
        setUser(api.getUser());

        getLibraryMaterials().then((items) => {
            setRecentMaterials(items.slice(0, 5));
            const latestPack = api.getLatestStudyPack();
            const flashcardItems = items.filter(i => i.resourceType === "Flashcards");
            const quizItems = items.filter(i => i.resourceType === "Quiz");

            let fCount = latestPack?.flashcards?.length || 0;
            flashcardItems.forEach(item => {
                try {
                    const parsed = JSON.parse(item.textContent || "[]");
                    fCount += Array.isArray(parsed) ? parsed.length : 1;
                } catch {
                    fCount += 1;
                }
            });

            setStats({
                materialsCount: items.length || (latestPack ? 1 : 0),
                flashcardsCount: fCount,
                quizzesCount: quizItems.length || (latestPack?.quiz?.length ? 1 : 0),
            });
        }).catch(() => {});
    }, []);

    function handleLogout() {
        const confirmed = window.confirm("Are you sure you want to sign out?");

        if (confirmed) {
            api.auth.logout();
            router.push("/login");
        }
    }

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const query = searchQuery.trim();

        if (!query) return;

        router.push(
            `/dashboard/library?search=${encodeURIComponent(query)}`
        );
    }

    return (
        <main className="h-screen overflow-hidden bg-[#faf7f2]">
            <div className="h-full">
                {/* Desktop sidebar - fixed to viewport */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col overflow-y-auto border-r border-stone-200 bg-white lg:flex">
                    {/* Logo */}
                    <div className="shrink-0 border-b border-stone-100 px-6 py-5">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                <GraduationCap size={23} />
                            </span>

                            <span className="text-xl font-bold text-gray-900">
                                LearnLite
                            </span>
                        </Link>
                    </div>

                    {/* Sidebar navigation */}
                    <div className="flex-1 px-4 py-6">
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Workspace
                        </p>

                        <nav className="space-y-1">
                            {navigation.map(({ label, href, Icon }) => {
                                const active = label === "Overview";

                                return (
                                    <Link
                                        key={label}
                                        href={href}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active
                                                ? "bg-teal-50 text-teal-800"
                                                : "text-gray-600 hover:bg-stone-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon size={19} />
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <p className="mb-3 mt-9 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Preferences
                        </p>

                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-stone-50 hover:text-gray-900"
                        >
                            <Settings size={19} />
                            Settings
                        </Link>

                        <a
                            href="mailto:support@learnlite.ai"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-stone-50 hover:text-gray-900"
                        >
                            <HelpCircle size={19} />
                            Help & Support
                        </a>
                    </div>

                    {/* Sidebar bottom card */}
                    <div className="shrink-0 border-t border-stone-100 p-5">
                        <div className="rounded-2xl bg-[#e3ede7] p-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-teal-700">
                                <Sparkles size={19} />
                            </span>

                            <p className="mt-3 text-sm font-semibold text-gray-900">
                                Learn smarter
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                Your lecture materials, organised for better learning.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main dashboard - independently scrollable */}
                <div className="h-full min-w-0 overflow-y-auto lg:ml-64">
                    {/* Top navigation */}
                    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
                        <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                            {/* Mobile logo and menu */}
                            <div className="flex items-center gap-3 lg:hidden">
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(true)}
                                    aria-label="Open navigation menu"
                                    className="rounded-xl p-2 text-gray-600 hover:bg-stone-100"
                                >
                                    <Menu size={22} />
                                </button>

                                <Link
                                    href="/"
                                    className="flex items-center gap-2"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                        <GraduationCap size={21} />
                                    </span>

                                    <span className="font-bold text-gray-900">
                                        LearnLite
                                    </span>
                                </Link>
                            </div>

                            {/* Search */}
                            <form
                                onSubmit={handleSearch}
                                className="hidden w-full max-w-md lg:block"
                            >
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Search your learning materials..."
                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                    />
                                </div>
                            </form>

                            {/* Profile and notifications */}
                            <div className="ml-auto flex items-center gap-3">
                                <OfflineStatusBar />
                                <Link
                                    href="/dashboard/library"
                                    aria-label="Open your library"
                                    className="rounded-xl p-2.5 text-gray-500 transition hover:bg-stone-100 hover:text-gray-900"
                                >
                                    <Bell size={20} />
                                </Link>

                                <div className="hidden h-8 w-px bg-stone-200 sm:block" />

                                <UserProfile
                                    name={user?.name || "Student"}
                                    email={user?.email || "student@example.com"}
                                    onSettings={() =>
                                        router.push("/dashboard/settings")
                                    }
                                    onLogout={handleLogout}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Mobile sidebar */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <button
                                type="button"
                                aria-label="Close navigation overlay"
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute inset-0 bg-black/40"
                            />

                            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-white shadow-xl">
                                <div className="flex shrink-0 items-center justify-between border-b border-stone-100 p-5">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 font-bold text-gray-900"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                            <GraduationCap size={21} />
                                        </span>

                                        LearnLite
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        aria-label="Close navigation"
                                        className="rounded-lg p-2 text-gray-500 hover:bg-stone-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                                    {navigation.map(
                                        ({ label, href, Icon }) => (
                                            <Link
                                                key={label}
                                                href={href}
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${label === "Overview"
                                                        ? "bg-teal-50 text-teal-800"
                                                        : "text-gray-600 hover:bg-stone-50"
                                                    }`}
                                            >
                                                <Icon size={19} />
                                                {label}
                                            </Link>
                                        )
                                    )}

                                    <div className="my-5 border-t border-stone-100" />

                                    <Link
                                        href="/dashboard/settings"
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 hover:bg-stone-50"
                                    >
                                        <Settings size={19} />
                                        Settings
                                    </Link>

                                    <a
                                        href="mailto:support@learnlite.ai"
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 hover:bg-stone-50"
                                    >
                                        <HelpCircle size={19} />
                                        Help & Support
                                    </a>
                                </nav>
                            </aside>
                        </div>
                    )}

                    {/* Dashboard body */}
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                        {/* Welcome section */}
                        <section id="overview">
                            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                                        Your learning space
                                    </p>

                                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                        Welcome back, Student 👋
                                    </h1>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        Ready to make your lecture materials easier to understand?
                                    </p>
                                </div>

                                <Link
                                    href="#add-materials"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                                >
                                    <Plus size={18} />
                                    Add materials
                                </Link>
                            </div>
                        </section>

                        {/* Statistics */}
                        <section className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Saved materials
                                    </span>

                                    <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
                                        <BookOpen size={19} />
                                    </span>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-gray-900">
                                    {stats.materialsCount}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Materials in your library
                                </p>
                            </div>

                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Flashcards ready
                                    </span>

                                    <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
                                        <Layers size={19} />
                                    </span>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-gray-900">
                                    {stats.flashcardsCount}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Cards ready for revision
                                </p>
                            </div>

                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Quizzes available
                                    </span>

                                    <span className="rounded-xl bg-purple-50 p-2 text-purple-700">
                                        <ClipboardList size={19} />
                                    </span>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-gray-900">
                                    {stats.quizzesCount}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Practice sessions completed
                                </p>
                            </div>
                        </section>

                        {/* Learning tools */}
                        <section id="learning-tools" className="mt-10">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Your learning tools
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Explore different ways to study your materials.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                {learningTools.map(
                                    ({
                                        title,
                                        description,
                                        Icon,
                                        color,
                                        href,
                                    }) => (
                                        <Link
                                            key={title}
                                            href={href}
                                            className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-teal-200 hover:shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                                                >
                                                    <Icon size={21} />
                                                </span>

                                                <ArrowUpRight
                                                    size={19}
                                                    className="text-gray-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal-700"
                                                />
                                            </div>

                                            <h3 className="mt-5 font-semibold text-gray-900">
                                                {title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                                {description}
                                            </p>

                                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                                                Explore{" "}
                                                <ChevronRight size={16} />
                                            </span>
                                        </Link>
                                    )
                                )}
                            </div>
                        </section>

                        {/* Add materials */}
                        <section
                            id="add-materials"
                            className="mt-10 scroll-mt-24 rounded-3xl border border-stone-200 bg-white"
                        >
                            <IngestPicker />
                        </section>

                        {/* Recent activity */}
                        <section id="recent-activity" className="mt-10">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Recent activity
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Your recently added learning materials.
                                    </p>
                                </div>

                                <Link
                                    href="/dashboard/library"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
                                >
                                    View library <ChevronRight size={16} />
                                </Link>
                            </div>

                            {recentMaterials.length > 0 ? (
                                <div className="mt-5 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
                                    {recentMaterials.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 sm:p-5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                                    {item.resourceType === "Flashcards" ? (
                                                        <Layers size={18} />
                                                    ) : item.resourceType === "Quiz" ? (
                                                        <ClipboardList size={18} />
                                                    ) : (
                                                        <FileText size={18} />
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-gray-900 text-sm">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {item.resourceType || item.type} &bull; {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {item.resourceType === "Flashcards" ? (
                                                    <Link
                                                        href="/dashboard/flashcards"
                                                        className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                                                    >
                                                        Review
                                                    </Link>
                                                ) : item.resourceType === "Quiz" ? (
                                                    <Link
                                                        href="/dashboard/quizzes"
                                                        className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                                                    >
                                                        Take Quiz
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href="/dashboard/library"
                                                        className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-stone-200"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-gray-500">
                                        <Clock3 size={22} />
                                    </span>

                                    <h3 className="mt-4 font-semibold text-gray-900">
                                        No recent activity yet
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Your saved materials and learning activities will appear here once created.
                                    </p>

                                    <a
                                        href="#add-materials"
                                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
                                    >
                                        Add your first notes <ArrowUpRight size={16} />
                                    </a>
                                </div>
                            )}
                        </section>

                        {/* Help */}
                        <section
                            id="help"
                            className="mt-10 rounded-2xl bg-[#e3ede7] p-6 sm:flex sm:items-center sm:justify-between"
                        >
                            <div>
                                <h2 className="font-bold text-gray-900">
                                    Need a little help?
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Reach out if you have questions about using LearnLite.
                                </p>
                            </div>

                            <a
                                href="mailto:support@learnlite.ai"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 sm:mt-0"
                            >
                                <HelpCircle size={17} />
                                Contact support
                            </a>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-stone-200 bg-white px-4 py-6 text-center text-xs text-gray-400">
                        © 2026 LearnLite AI. Built to make learning easier.
                    </footer>
                </div>
            </div>
        </main>
    );
}