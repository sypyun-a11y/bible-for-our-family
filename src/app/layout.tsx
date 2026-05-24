import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "말씀 — 개역한글 성경",
  description: "오늘의 말씀, 통독, 검색, 메모. 개역한글판 성경 앱.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

const navItems = [
  { href: "/", label: "오늘" },
  { href: "/read", label: "읽기" },
  { href: "/search", label: "검색" },
  { href: "/plan", label: "통독" },
  { href: "/saved", label: "보관함" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--background)]/80 border-b border-[color:var(--border)]">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              말씀
            </Link>
            <span className="text-xs text-[color:var(--muted)]">개역한글</span>
          </div>
        </header>

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-24 pt-6">
          {children}
        </main>

        <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur-md">
          <div className="max-w-3xl mx-auto grid grid-cols-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center h-14 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </body>
    </html>
  );
}
