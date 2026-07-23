"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ProductCard } from "./product-card";
import { SendInquiryDialog } from "./send-inquiry-dialog";
import type { CatalogData, CatalogProduct } from "@/lib/catalog";

const tabClass = (active: boolean) =>
  `shrink-0 border-b-2 px-1 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:text-ultra ${
    active
      ? "border-ultra text-ink"
      : "border-transparent text-ink-soft hover:text-ultra hover:border-hairline"
  }`;

const subPillClass = (active: boolean) =>
  `rounded-none border px-3 py-1.5 text-[13px] font-medium transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultra/40 ${
    active
      ? "border-ultra bg-tint text-ultra"
      : "border-hairline bg-paper text-ink-soft hover:border-ultra hover:text-ultra"
  }`;

export function CatalogPage({
  initialData,
  basePath,
  initialCategoryId = null,
  initialSubcategoryId = null,
}: {
  initialData: CatalogData;
  /** When set (e.g. "/cricket"), category/subcategory selection navigates to shareable nested URLs instead of staying client-side only. */
  basePath?: string;
  initialCategoryId?: number | null;
  initialSubcategoryId?: number | null;
}) {
  const data = initialData;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(initialSubcategoryId);
  const [inquiryProduct, setInquiryProduct] = useState<CatalogProduct | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const activeCategory = data.categories.find((c) => c.id === categoryId);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter((p) => {
      if (categoryId !== null && p.categoryId !== categoryId) return false;
      if (subcategoryId !== null && p.subcategoryId !== subcategoryId) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.blurb} ${p.categoryName} ${
        p.subcategoryName ?? ""
      } ${p.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [data.products, query, categoryId, subcategoryId]);

  const selectCategory = (id: number | null) => {
    setCategoryId(id);
    setSubcategoryId(null);
    if (!basePath) return;
    const category = id !== null ? data.categories.find((c) => c.id === id) : undefined;
    router.push(category ? `${basePath}/${category.slug}` : basePath);
  };

  const selectSubcategory = (id: number | null) => {
    setSubcategoryId(id);
    if (!basePath || !activeCategory) return;
    const subcategory = id !== null ? activeCategory.subcategories.find((s) => s.id === id) : undefined;
    router.push(subcategory ? `${basePath}/${activeCategory.slug}/${subcategory.slug}` : `${basePath}/${activeCategory.slug}`);
  };

  const openInquiry = (product: CatalogProduct) => {
    setInquiryProduct(product);
    setInquiryOpen(true);
  };

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-5 pb-12 pt-20 md:px-8 md:pb-16 md:pt-24">
      {basePath && (
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ultra focus-visible:outline-none focus-visible:text-ultra"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <path d="M14 8H3M7 3.5 2.5 8 7 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to all collections
        </Link>
      )}
      <div className="flex flex-col gap-4">
        <div className="relative w-full md:w-96">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gloves, helmets, balls..."
            aria-label="Search products"
            className="w-full border-b-2 border-hairline bg-transparent py-3 pl-7 pr-2 text-[15px] text-ink outline-none transition focus:border-ultra"
          />
        </div>

        <div className="relative -mx-5 px-5 md:mx-0 md:px-0">
          <div
            className="flex gap-6 overflow-x-auto border-b border-hairline pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ maskImage: "linear-gradient(to right, black calc(100% - 24px), transparent)" }}
          >
            <button
              onClick={() => selectCategory(null)}
              aria-pressed={categoryId === null}
              className={tabClass(categoryId === null)}
            >
              All
            </button>
            {data.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.id)}
                aria-pressed={categoryId === c.id}
                className={tabClass(categoryId === c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="-mx-5 mt-3 flex items-center gap-2 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {activeCategory.name}:
          </span>
          <button
            onClick={() => selectSubcategory(null)}
            aria-pressed={subcategoryId === null}
            className={`shrink-0 ${subPillClass(subcategoryId === null)}`}
          >
            All
          </button>
          {activeCategory.subcategories.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSubcategory(s.id)}
              aria-pressed={subcategoryId === s.id}
              className={`shrink-0 ${subPillClass(subcategoryId === s.id)}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:mt-10 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} onInquire={openInquiry} />
          ))}
        </div>
      ) : (
        <div className="mt-12 dashed-stitch border bg-paper px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold tracking-tight text-ink">
            Nothing matches that
          </p>
          <p className="mx-auto mt-2 max-w-[40ch] text-sm leading-relaxed text-ink-soft">
            Try a different word, or clear the filters. If you need something
            specific, message us on WhatsApp — we&apos;ll help you find it.
          </p>
          <button
            onClick={() => {
              setQuery("");
              selectCategory(null);
            }}
            className="mt-5 rounded-none border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultra/40"
          >
            Clear search & filters
          </button>
        </div>
      )}

      <SendInquiryDialog product={inquiryProduct} open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </section>
  );
}
