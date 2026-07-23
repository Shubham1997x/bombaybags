"use client";

import { useState, type FormEvent } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import type { CatalogProduct } from "@/lib/catalog";
import { submitProductInquiry } from "@/app/actions/catalog";
import { waLink } from "@/lib/site";

type Status = "idle" | "sending" | "done" | "error";

const inputClass =
  "w-full rounded-lg border border-hairline bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-ultra focus:ring-2 focus:ring-ultra/25";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft";

export function SendInquiryDialog({
  product,
  open,
  onOpenChange,
}: {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");

  const handleOpenChange = (next: boolean) => {
    if (!next) setStatus("idle");
    onOpenChange(next);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await submitProductInquiry({
        productId: product?.id ?? null,
        productName: product?.name ?? "General Inquiry",
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-hairline bg-paper text-ink sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Send Inquiry
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-soft">
            {product ? (
              <>
                About <span className="font-semibold text-ultra">{product.name}</span>. We reply within a
                working day.
              </>
            ) : (
              "We reply within a working day."
            )}
          </DialogDescription>
        </DialogHeader>

        {status === "done" ? (
          <div className="flex flex-col items-start gap-4 py-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ultra text-paper">
              <svg viewBox="0 0 16 16" fill="none" className="h-6 w-6" aria-hidden="true">
                <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="font-display text-xl font-extrabold tracking-tight text-ink">Inquiry received</p>
              <p className="mt-1 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                We reply within a working day, or sooner on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="inq-name" className={labelClass}>
                Name
              </label>
              <input id="inq-name" name="name" required minLength={2} className={inputClass} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="inq-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="inq-phone"
                name="phone"
                type="tel"
                required
                pattern="[+]?[0-9\s-]{10,15}"
                className={inputClass}
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="inq-email" className={labelClass}>
                Email <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input id="inq-email" name="email" type="email" className={inputClass} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="inq-message" className={labelClass}>
                Message <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="inq-message"
                name="message"
                rows={3}
                maxLength={500}
                className={inputClass}
                placeholder="Quantity, size, delivery timeline..."
              />
            </div>
            {status === "error" && (
              <p className="text-sm font-medium text-ink">
                That did not go through. Check the details, or message us directly on{" "}
                <a href={waLink()} target="_blank" rel="noreferrer" className="text-ultra underline">
                  WhatsApp
                </a>
                .
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-ultra px-7 py-3 text-sm font-semibold text-paper transition-colors duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:justify-self-start"
            >
              {status === "sending" ? "Sending…" : "Send Inquiry"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
