<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Catalogue template workflow

This project is a per-client copy of `D:\Work\_template-catalogue`. Taxonomy is
Collection → Category → Subcategory → Product. All branding/contact/hero copy
lives in `lib/site.ts`; theme colours in `app/globals.css` `@theme` variables —
edit those, never hardcode client names in components.

Client data flow: put WhatsApp images in `intake/images/<Collection>/<Category>/`
and/or Firecrawl output at `intake/scraped/products-raw.json`, run
`node scripts/build-from-intake.mjs`, enrich `prisma/seed-data.json`
(names, blurbs, prices, tags — look at the actual images in `public/uploads/`
when writing names/blurbs), then `npm run db:seed`. See `intake/README.md`.
