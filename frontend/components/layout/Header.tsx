import { GraduationCap } from "lucide-react";

export default function Header() {
    return (
        <header className="border-b border-gray-200">
            <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3 lg:px-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <GraduationCap size={20} />
                </span>
                <span className="text-lg font-bold">LearnLite</span>
            </div>
        </header>
    );
}