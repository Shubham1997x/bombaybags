"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logout } from "@/app/actions/auth";
import { site } from "@/lib/site";

const NAV = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/taxonomy", label: "Categories & Tags" },
  { to: "/admin/inquiries", label: "Inquiries" },
] as const;

function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra md:hidden"
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
        {open ? (
          <path d="M3.5 3.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-5 py-2.5 md:h-14 md:py-0 md:px-8">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ultra font-display text-sm font-extrabold text-paper">
              V
            </span>
            <span className="truncate font-display text-base font-extrabold tracking-tight text-ink">
              {site.name}
            </span>
            <span className="hidden shrink-0 rounded-md bg-tint px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ultra sm:inline-block">
              Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  pathname === item.to ? "bg-ultra text-paper" : "text-ink-soft hover:text-ultra"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="ml-2 shrink-0 whitespace-nowrap rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
            >
              View website
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 whitespace-nowrap rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
            >
              Log out
            </button>
          </nav>

          <MenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>

        {menuOpen && (
          <nav className="border-t border-hairline/60 bg-paper px-5 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-2 py-3 text-[15px] font-semibold transition-colors ${
                  pathname === item.to ? "text-ultra" : "text-ink active:bg-tint"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-2 py-3 text-[15px] font-semibold text-ink transition-colors active:bg-tint"
            >
              View website
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="block w-full rounded-lg px-2 py-3 text-left text-[15px] font-semibold text-ink transition-colors active:bg-tint"
            >
              Log out
            </button>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
