import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnLite",
  description: "Turn your lecture notes into clearer learning resources",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}