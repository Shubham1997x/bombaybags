"use client";

import Link from "next/link";
import { useState } from "react";
import { SendInquiryDialog } from "./send-inquiry-dialog";
import { CartDrawer } from "./cart-drawer";

import { site, waLink, telLink } from "@/lib/site";
import { useCart } from "@/lib/cart";

const LINKS = [
  { href: "#catalog", label: "Catalog" },
  { href: waLink(), label: "WhatsApp" },
  { href: telLink(), label: "Call us" },
];

function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultra/40 lg:hidden"
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

function GetQuoteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-gold px-2.5 py-2.5 text-[12px] font-bold uppercase tracking-wide text-plate shadow-sm transition-all hover:brightness-110 active:scale-[0.97] sm:gap-2 sm:px-4 sm:text-[13px] md:px-5"
      >
        <span className="hidden sm:inline">Get a Quote</span>
        <span className="sm:hidden">Quote</span>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <SendInquiryDialog product={null} open={open} onOpenChange={setOpen} />
    </>
  );
}

function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultra/40"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M1.5 1.5h1.5l1.4 8.4a1 1 0 0 0 1 .83h5.7a1 1 0 0 0 1-.8l1-5.2H4.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="13.5" r="1" fill="currentColor" />
          <circle cx="11.5" cy="13.5" r="1" fill="currentColor" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ultra px-1 text-[10px] font-bold tabular-nums text-paper">
            {count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-5 md:px-8">
        <Link
          href="/#top"
          onClick={() => setMenuOpen(false)}
          className="flex min-w-0 shrink items-center gap-2"
        >
          <span className="truncate font-display text-xl font-semibold tracking-tight text-ink sm:text-[1.375rem]">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
              className="relative text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-ultra after:transition-all after:duration-200 hover:text-ultra hover:after:w-full focus-visible:outline-none focus-visible:text-ultra focus-visible:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={telLink()}
            className="hidden items-center gap-2 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ultra sm:flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="tabular-nums">{site.phone}</span>
          </a>
          <CartButton />
          <GetQuoteButton />
          <MenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>
      </div>

      <div className="stitch-rule" aria-hidden="true" />

      {menuOpen && (
        <nav className="border-t border-hairline/60 bg-paper px-4 py-2 lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
              className="flex items-center rounded-lg px-2 py-3 text-[15px] font-semibold text-ink transition-colors active:bg-tint"
            >
              {l.label}
            </a>
          ))}
          <a
            href={telLink()}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-3 text-[15px] font-semibold text-ink transition-colors active:bg-tint sm:hidden"
          >
            <span className="tabular-nums">{site.phone}</span>
          </a>
        </nav>
      )}
    </header>
  );
}
