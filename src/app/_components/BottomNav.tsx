"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  BookmarkIcon,
  CalendarIcon,
  SearchIcon,
  SunIcon,
} from "@/lib/icons";

const items = [
  { href: "/", label: "오늘", Icon: SunIcon, match: (p: string) => p === "/" },
  { href: "/read", label: "읽기", Icon: BookIcon, match: (p: string) => p.startsWith("/read") },
  { href: "/search", label: "검색", Icon: SearchIcon, match: (p: string) => p.startsWith("/search") },
  { href: "/plan", label: "통독", Icon: CalendarIcon, match: (p: string) => p.startsWith("/plan") },
  { href: "/saved", label: "보관함", Icon: BookmarkIcon, match: (p: string) => p.startsWith("/saved") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur-xl safe-bottom">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 h-16 transition-colors"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  active ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors ${
                  active ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
