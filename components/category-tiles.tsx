import Link from "next/link";
import Image from "next/image";
import type { CatalogCollection } from "@/lib/catalog";

export function CategoryTiles({ collections }: { collections: CatalogCollection[] }) {
  if (collections.length === 0) return null;

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ultra">
            Shop by collection
          </span>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Browse our range
          </h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-4">
        {collections.map((s) => (
          <Link key={s.id} href={`/${s.slug}`} className="group flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden border border-hairline bg-tint transition-colors duration-300 group-hover:dashed-stitch">
              <Image
                src={s.image ?? "/uploads/multicolor-laptop-sleeve-set.jpeg"}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>

            <div className="mt-3 flex flex-col items-start gap-1">
              <span className="font-display text-lg font-medium tracking-tight text-ink">
                {s.name}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition-colors group-hover:text-ultra">
                Shop now
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
