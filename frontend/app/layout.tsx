import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import ServiceWorkerRegister from "@/components/offline/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnLite AI — Smart Offline-Ready Study Platform",
  description:
    "Transform lecture notes into high-yield summaries, flashcards, quizzes, and live grounded AI tutor sessions with full offline support.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LearnLite AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          expand={false}
        />
      </body>
    </html>
  );
}
