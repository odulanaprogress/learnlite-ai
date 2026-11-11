
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnLite AI",
  description:
    "Transform your lecture materials into smarter learning resources with LearnLite AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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