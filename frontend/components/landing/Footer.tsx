
import Link from "next/link";
import { GraduationCap } from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About us", href: "#about" },
];

const accountLinks = [
  { label: "Sign in", href: "/login" },
  { label: "Get Started", href: "/signup" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#faf7f2]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <GraduationCap size={23} />
              </span>

              <span className="text-xl font-bold text-gray-900">
                LearnLite<span className="text-teal-600">.</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-7 text-gray-600">
              Your smarter learning companion.
              Transform lecture materials into meaningful
              learning experiences.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-teal-700"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-semibold text-gray-900">
              Get Started
            </h3>

            <ul className="mt-5 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-teal-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} LearnLite AI. All rights reserved.
          </p>

          <p>
            Learn smarter, not harder.
          </p>
        </div>

      </div>
    </footer>
  );
}