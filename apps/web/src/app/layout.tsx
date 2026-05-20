/**
 * apps/web/src/app/layout.tsx
 *
 * Root layout for the Puff web app.
 *
 * Responsibilities:
 *   - Define the document shell (html, body)
 *   - Load Geist fonts (Vercel's typeface, designed for code-heavy UIs)
 *   - Set site-wide metadata (title, description, social previews)
 *
 * Metadata strategy:
 *   - title.template uses %s for per-page titles ("About | Puff", "Blog | Puff")
 *   - metadataBase ensures Open Graph URLs are absolute (required for previews)
 *   - Open Graph and Twitter cards make links look real when shared
 *
 * Phase 2 will add a real layout (nav, footer, theme). For now this is
 * the minimal shell that proves the system works.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://puff-puce.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Puff — AI Engineering Ecosystem",
    template: "%s | Puff",
  },
  description:
    "AI engineering portfolio by Muhammad Irfan. Production-grade infrastructure, RAG systems, and multi-agent workflows.",
  keywords: [
    "AI engineering",
    "software engineering",
    "Next.js",
    "TypeScript",
    "RAG",
    "AI agents",
    "Muhammad Irfan",
  ],
  authors: [{ name: "Muhammad Irfan" }],
  creator: "Muhammad Irfan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Puff",
    title: "Puff — AI Engineering Ecosystem",
    description:
      "AI engineering portfolio by Muhammad Irfan. Production-grade infrastructure, RAG systems, and multi-agent workflows.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puff — AI Engineering Ecosystem",
    description:
      "AI engineering portfolio by Muhammad Irfan. Production-grade infrastructure, RAG systems, and multi-agent workflows.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
