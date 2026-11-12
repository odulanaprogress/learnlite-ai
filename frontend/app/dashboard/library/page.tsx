"use client";

import OfflineStatusBar from "@/components/offline/OfflineStatusBar";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    Download,
    Eye,
    File,
    FileText,
    Image as ImageIcon,
    Presentation,
    Search,
    Trash2,
    X,
    Sparkles,
    Layers,
    ClipboardList,
    MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
    deleteLibraryMaterial,
    getLibraryMaterials,
    type LibraryMaterial,
} from "@/lib/library";

type Preview = {
    material: LibraryMaterial;
    url: string | null;
};

const filters = [
    "All",
    "PDF",
    "Word",
    "PowerPoint",
    "Text",
    "Image",
    "AI Summary",
    "Flashcards",
    "Quiz",
    "Tutor Conversation",
];

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function MaterialIcon({ type }: { type: string }) {
    switch (type) {
        case "Image":
            return <ImageIcon size={21} />;
        case "PowerPoint":
            return <Presentation size={21} />;
        case "AI Summary":
            return <Sparkles size={21} />;
        case "Flashcards":
            return <Layers size={21} />;
        case "Quiz":
            return <ClipboardList size={21} />;
        case "Tutor Conversation":
            return <MessageCircle size={21} />;
        case "PDF":
        case "Word":
        case "Text":
            return <FileText size={21} />;
        default:
            return <File size={21} />;
    }
}

function isGenerated(material: LibraryMaterial) {
    return material.category === "generated";
}

export default function LibraryPage() {
    const [materials, setMaterials] = useState<LibraryMaterial[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [preview, setPreview] = useState<Preview | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] =
        useState<LibraryMaterial | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Load saved materials from IndexedDB.
    useEffect(() => {
        let cancelled = false;

        getLibraryMaterials()
            .then((savedMaterials) => {
                if (!cancelled) {
                    setMaterials(savedMaterials);
                }
            })
            .catch((err: unknown) => {
                console.error("Library loading error:", err);

                if (!cancelled) {
                    toast.error(
                        "Couldn't load your library. Please refresh and try again."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Release temporary preview URLs when the preview closes or changes.
    useEffect(() => {
        const currentUrl = preview?.url;

        return () => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [preview]);

    // Search and filter materials.
    const filteredMaterials = useMemo(() => {
        return materials.filter((material) => {
            const matchesSearch = [
                material.name,
                material.type,
                material.resourceType ?? "",
            ]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "All" ||
                material.type === filter ||
                material.resourceType === filter;

            return matchesSearch && matchesFilter;
        });
    }, [materials, search, filter]);

    const originalCount = materials.filter(
        (material) => !isGenerated(material)
    ).length;

    const generatedCount = materials.filter(isGenerated).length;

    function openPreview(material: LibraryMaterial) {
        const url = material.file
            ? URL.createObjectURL(material.file)
            : null;

        setPreview({ material, url });
    }

    function downloadMaterial(material: LibraryMaterial) {
        let blob: Blob;
        let filename = material.name;

        if (material.file) {
            blob = material.file;
        } else if (material.textContent !== undefined) {
            blob = new Blob([material.textContent], {
                type: "text/plain;charset=utf-8",
            });

            if (!filename.toLowerCase().endsWith(".txt")) {
                filename = `${filename}.txt`;
            }
        } else {
            toast.error("This material has no downloadable content.");
            return;
        }

        try {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = filename;

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            window.setTimeout(() => URL.revokeObjectURL(url), 1000);

            toast.success("Your download has started.");
        } catch (err) {
            console.error("Download error:", err);
            toast.error("Unable to download this material.");
        }
    }

    async function handleDelete(material: LibraryMaterial) {
        if (deleting) return;

        setDeleting(true);

        try {
            await deleteLibraryMaterial(material.id);

            setMaterials((current) =>
                current.filter((item) => item.id !== material.id)
            );

            if (preview?.material.id === material.id) {
                setPreview(null);
            }

            setConfirmDelete(null);

            toast.success("Material deleted successfully.");
        } catch (err) {
            console.error("Library deletion error:", err);
            toast.error("Could not delete this material. Please try again.");
        } finally {
            setDeleting(false);
        }
    }

    function getSourceName(material: LibraryMaterial) {
        if (!material.sourceMaterialId) return null;

        const source = materials.find(
            (item) => item.id === material.sourceMaterialId
        );

        return source?.name ?? "Original material";
    }

    return (
        <main className="min-h-screen bg-[#faf7f2]">
            {/* Header */}
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-teal-700"
                    >
                        <ArrowLeft size={18} />
                        Back to dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        <OfflineStatusBar />
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-bold text-gray-900"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                                <BookOpen size={19} />
                            </span>
                            LearnLite
                        </Link>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                            Your learning space
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                            My Library
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                            Your lecture materials and saved AI-generated learning
                            resources, all in one place.
                        </p>
                    </div>

                    <Link
                        href="/dashboard#add-materials"
                        className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                        Add materials
                    </Link>
                </div>

                {/* Summary cards */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Original materials
                            </p>
                            <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
                                <BookOpen size={20} />
                            </span>
                        </div>

                        <p className="mt-3 text-3xl font-bold text-gray-900">
                            {originalCount}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Uploaded documents, images and notes
                        </p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Generated resources
                            </p>
                            <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
                                <Sparkles size={20} />
                            </span>
                        </div>

                        <p className="mt-3 text-3xl font-bold text-gray-900">
                            {generatedCount}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Saved summaries, flashcards, quizzes and tutor chats
                        </p>
                    </div>
                </div>

                {/* Search and filters */}
                <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Your saved resources
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {materials.length}{" "}
                                {materials.length === 1 ? "item" : "items"} in your library
                            </p>
                        </div>

                        <label className="relative block w-full sm:max-w-sm">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search your library..."
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {filters.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setFilter(item)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === item
                                        ? "bg-teal-700 text-white"
                                        : "bg-stone-100 text-gray-600 hover:bg-stone-200"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-gray-500">
                        Loading your library...
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    /* Empty state */
                    <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <BookOpen size={25} />
                        </span>

                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            {materials.length === 0
                                ? "Your library is empty"
                                : "No matching resources"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                            {materials.length === 0
                                ? "Upload your lecture notes or save AI-generated learning resources to build your personal library."
                                : "Try another search term or choose a different resource type."}
                        </p>

                        {materials.length === 0 && (
                            <Link
                                href="/dashboard#add-materials"
                                className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                            >
                                Add your first material
                            </Link>
                        )}
                    </div>
                ) : (
                    /* Materials grid */
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredMaterials.map((material) => {
                            const generated = isGenerated(material);
                            const sourceName = getSourceName(material);

                            return (
                                <article
                                    key={material.id}
                                    className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-teal-200"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${generated
                                                    ? "bg-orange-50 text-orange-600"
                                                    : "bg-teal-50 text-teal-700"
                                                }`}
                                        >
                                            <MaterialIcon type={material.type} />
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${generated
                                                    ? "bg-orange-50 text-orange-700"
                                                    : "bg-teal-50 text-teal-700"
                                                }`}
                                        >
                                            {generated
                                                ? `AI · ${material.type}`
                                                : `Original · ${material.type}`}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 break-words font-semibold text-gray-900">
                                        {material.name}
                                    </h3>

                                    {sourceName && (
                                        <p className="mt-2 truncate text-xs text-teal-700">
                                            Based on: {sourceName}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-gray-500">
                                        {formatSize(material.size)} ·{" "}
                                        {formatDate(material.createdAt)}
                                    </p>

                                    <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => openPreview(material)}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                                        >
                                            <Eye size={16} />
                                            Open
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => downloadMaterial(material)}
                                            aria-label={`Download ${material.name}`}
                                            className="rounded-lg p-2.5 text-gray-500 transition hover:bg-stone-100 hover:text-gray-900"
                                        >
                                            <Download size={18} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(material)}
                                            aria-label={`Delete ${material.name}`}
                                            className="rounded-lg p-2.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Inline delete confirmation */}
                                    {confirmDelete?.id === material.id && (
                                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                                            <p className="text-sm font-semibold text-gray-900">
                                                Delete this material?
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                                This will permanently remove
                                                {material.name}  from your library.
                                            </p>

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={deleting}
                                                    onClick={() =>
                                                        void handleDelete(material)
                                                    }
                                                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deleting
                                                        ? "Deleting..."
                                                        : "Yes, delete"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={deleting}
                                                    onClick={() =>
                                                        setConfirmDelete(null)
                                                    }
                                                    className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-stone-100 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Preview modal */}
            {preview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Preview ${preview.material.name}`}
                >
                    <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between gap-4 border-b border-stone-200 p-4">
                            <div className="min-w-0">
                                <h2 className="truncate font-semibold text-gray-900">
                                    {preview.material.name}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {preview.material.type}
                                    {isGenerated(preview.material)
                                        ? " · AI-generated resource"
                                        : " · Original material"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPreview(null)}
                                aria-label="Close preview"
                                className="rounded-lg p-2 text-gray-500 hover:bg-stone-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="min-h-64 flex-1 overflow-auto bg-stone-50 p-4 sm:p-6">
                            {preview.material.textContent !== undefined ? (
                                (() => {
                                    let raw = preview.material.textContent.trim();
                                    const resType = preview.material.resourceType;

                                    // Strip markdown code fences if present (e.g. ```json ... ```)
                                    if (raw.startsWith("```")) {
                                        raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
                                    }

                                    // Attempt parsing JSON if structured
                                    let parsedData: any = null;
                                    if (raw.startsWith("{") || raw.startsWith("[")) {
                                        try {
                                            parsedData = JSON.parse(raw);
                                        } catch {}
                                    }

                                    // 1. Interactive Quiz Viewer
                                    // Handles array directly or object containing { quiz: [...] } or { questions: [...] }
                                    const quizCandidate = Array.isArray(parsedData)
                                        ? parsedData
                                        : (parsedData?.quiz || parsedData?.questions);

                                    const isQuizContent =
                                        resType === "Quiz" ||
                                        (Array.isArray(quizCandidate) &&
                                            quizCandidate.length > 0 &&
                                            (quizCandidate[0]?.question || quizCandidate[0]?.options));

                                    if (isQuizContent && Array.isArray(quizCandidate) && quizCandidate.length > 0) {
                                        return (
                                            <div className="space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                                                            Practice Exam Questions ({quizCandidate.length})
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Review questions, correct answer keys, and academic explanations.
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href="/dashboard/quizzes"
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-100 px-3.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-200 transition"
                                                    >
                                                        Take in Interactive Mode &rarr;
                                                    </Link>
                                                </div>

                                                {quizCandidate.map((q: any, qIdx: number) => {
                                                    const questionText = q?.question || q?.prompt || `Question #${qIdx + 1}`;
                                                    const rawOptions = Array.isArray(q?.options)
                                                        ? q.options
                                                        : (typeof q?.options === "string" ? q.options.split(/\n|,/).filter(Boolean) : []);
                                                    
                                                    // Ensure at least 4 options
                                                    const options = [...rawOptions];
                                                    while (options.length < 4) {
                                                        options.push(`Alternative concept not applicable to this question.`);
                                                    }

                                                    const correctIdx = typeof q?.correct_answer_index === "number"
                                                        ? q.correct_answer_index
                                                        : (typeof q?.answer === "number" ? q.answer : 0);

                                                    const explanation = q?.explanation || "Based on your lecture notes, this statement is the verified correct answer.";

                                                    return (
                                                        <div key={qIdx} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                                                            <div className="flex items-start gap-2.5">
                                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                                                                    {qIdx + 1}
                                                                </span>
                                                                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                                                                    {questionText}
                                                                </h3>
                                                            </div>

                                                            <div className="mt-4 space-y-2">
                                                                {options.map((opt: string, oIdx: number) => {
                                                                    const isCorrect = oIdx === correctIdx;
                                                                    return (
                                                                        <div
                                                                            key={oIdx}
                                                                            className={`flex items-start gap-3 rounded-xl p-3 text-xs sm:text-sm border transition ${
                                                                                isCorrect
                                                                                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium"
                                                                                    : "border-stone-200 bg-stone-50/50 text-gray-700"
                                                                            }`}
                                                                        >
                                                                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                                                                isCorrect ? "bg-emerald-600 text-white" : "bg-stone-200 text-gray-700"
                                                                            }`}>
                                                                                {String.fromCharCode(65 + oIdx)}
                                                                            </span>
                                                                            <span className="flex-1">{opt}</span>
                                                                            {isCorrect && (
                                                                                <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                                                                                    &check; Correct Answer
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {explanation && (
                                                                <div className="mt-3.5 rounded-xl bg-teal-50/70 p-3 text-xs text-teal-900 border border-teal-100">
                                                                    <p className="font-bold uppercase tracking-wider text-[10px] text-teal-800">
                                                                        Academic Explanation:
                                                                    </p>
                                                                    <p className="mt-1 leading-relaxed text-gray-700">{explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }

                                    // 2. Flashcards Viewer
                                    const cardsCandidate = Array.isArray(parsedData)
                                        ? parsedData
                                        : parsedData?.flashcards;

                                    const isFlashcardContent =
                                        resType === "Flashcards" ||
                                        (Array.isArray(cardsCandidate) &&
                                            cardsCandidate.length > 0 &&
                                            cardsCandidate[0]?.question &&
                                            cardsCandidate[0]?.answer);

                                    if (isFlashcardContent && Array.isArray(cardsCandidate) && cardsCandidate.length > 0) {
                                        return (
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                                                            Active Recall Cards ({cardsCandidate.length})
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Study cards for quick review and memorization.
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href="/dashboard/flashcards"
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-100 px-3.5 py-2 text-xs font-bold text-orange-700 hover:bg-orange-200 transition"
                                                    >
                                                        Flip in Flashcards Mode &rarr;
                                                    </Link>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {cardsCandidate.map((card: any, idx: number) => (
                                                        <div key={idx} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                                                            <div className="flex items-center justify-between text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-2">
                                                                <span>Card #{idx + 1}</span>
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-900">
                                                                Q: {card.question}
                                                            </p>
                                                            <div className="mt-2.5 rounded-xl bg-stone-50 p-2.5 text-xs text-gray-700 border border-stone-100">
                                                                <span className="font-semibold text-teal-800">A: </span>
                                                                {card.answer}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 3. Formatted Academic Summary / Notes Viewer
                                    // If raw is an object with a summary field, render the summary text!
                                    const displayText = typeof parsedData?.summary === "string" ? parsedData.summary : raw;

                                    return (
                                        <div className="rounded-2xl bg-white p-6 shadow-xs border border-stone-200 leading-relaxed text-gray-800 text-sm whitespace-pre-wrap">
                                            {displayText}
                                        </div>
                                    );
                                })()
                            ) : preview.url &&
                                preview.material.type === "Image" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={preview.url}
                                    alt={preview.material.name}
                                    className="mx-auto max-h-[65vh] max-w-full object-contain"
                                />
                            ) : preview.url &&
                                preview.material.type === "PDF" ? (
                                <iframe
                                    src={preview.url}
                                    title={preview.material.name}
                                    className="h-[65vh] w-full rounded-lg bg-white"
                                />
                            ) : (
                                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                    <FileText
                                        size={35}
                                        className="text-gray-400"
                                    />

                                    <p className="mt-3 font-medium text-gray-800">
                                        Preview is not available for this file type.
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Download the material to open it on your device.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            downloadMaterial(preview.material)
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                                    >
                                        <Download size={16} />
                                        Download material
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}