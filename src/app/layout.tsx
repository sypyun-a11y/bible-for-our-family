import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "./_components/BottomNav";

export const metadata: Metadata = {
  title: "말씀 — 개역한글 성경",
  description: "오늘의 말씀, 통독, 검색, 메모. 개역한글판 성경 앱.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "말씀",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <main className="flex-1 w-full max-w-2xl mx-auto px-5 pb-28 pt-6 safe-top">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
