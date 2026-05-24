import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "./_components/BottomNav";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const ogTitle = "말씀 — 오늘의 한 구절";
const ogDescription = "조용한 아침에 깃드는 한 구절. 매일의 묵상, 통독, 그리고 마음에 남기는 메모.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: ogTitle,
    template: "%s · 말씀",
  },
  description: ogDescription,
  applicationName: "말씀",
  authors: [{ name: "말씀" }],
  keywords: ["성경", "개역한글", "매일 묵상", "통독", "오늘의 말씀", "Bible", "Korean Bible"],
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    type: "website",
    locale: "ko_KR",
    siteName: "말씀",
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  },
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
