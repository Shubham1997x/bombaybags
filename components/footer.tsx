import { site, waLink, telLink } from "@/lib/site";

const COLUMNS = [
  {
    head: "Explore",
    links: [
      { label: "Catalog", href: "#catalog" },
      { label: "Back to top", href: "#top" },
    ],
  },
  {
    head: "Contact",
    links: [
      { label: "WhatsApp", href: waLink() },
      { label: site.phone, href: telLink() },
      { label: site.email, href: `mailto:${site.email}` },
    ],
  },
];

function splitBlurb(blurb: string): [string, string] {
  const idx = blurb.indexOf(" — ");
  if (idx === -1) return [blurb, ""];
  return [blurb.slice(0, idx), blurb.slice(idx + 3)];
}

export function Footer() {
  const [eyebrow, rest] = splitBlurb(site.footerBlurb);

  return (
    <footer className="bg-paper pb-24 md:pb-0">
      <div className="stitch-rule" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-[2fr_1fr_1fr_2fr] md:gap-8 md:px-8 md:py-16">
        <div>
          <p className="font-display text-4xl font-semibold leading-[0.95] tracking-tight text-ink md:text-5xl">
            {site.name}
          </p>
          <p className="mt-4 max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-ink-soft">
            {eyebrow}
          </p>
          {rest && (
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{rest}</p>
          )}
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.head}>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
              {col.head}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-sm text-ink transition-colors hover:text-ultra focus-visible:outline-none focus-visible:text-ultra"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
            Get In Touch
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">{site.owner}</span>
            <br />
            {site.address}
          </p>
        </div>
      </div>
      <div className="stitch-rule" aria-hidden="true" />
      <div>
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-ink-soft md:px-8">
          &copy; {new Date().getFullYear()} {site.name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
