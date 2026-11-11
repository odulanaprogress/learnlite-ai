
"use client";

import { useState } from "react";
import { ChevronDown, Settings, LogOut } from "lucide-react";

type Props = {
    name: string;
    email: string;
    onSettings?: () => void;
    onLogout?: () => void;
};

export default function UserProfile({
    name,
    email,
    onSettings,
    onLogout,
}: Props) {
    const [open, setOpen] = useState(false);

    const initials = name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label="Open user profile menu"
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                    {initials || "S"}
                </span>

                <span className="hidden text-left sm:block">
                    <span className="block max-w-32 truncate text-sm font-semibold text-gray-900">
                        {name}
                    </span>
                    <span className="block max-w-32 truncate text-xs text-gray-500">
                        {email}
                    </span>
                </span>

                <ChevronDown size={16} className="text-gray-400" />
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close profile menu"
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                    />

                    <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
                        <div className="border-b border-gray-100 px-3 py-3">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {name}
                            </p>
                            <p className="truncate text-xs text-gray-500">{email}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onSettings?.();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Settings size={17} />
                            Account settings
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onLogout?.();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={17} />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}