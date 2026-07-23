# Client Catalogue Template

Next.js 16 + Prisma/SQLite product-catalogue demo site with WhatsApp enquiry,
cart-based bulk quotes, and an admin panel (products, taxonomy, inquiries).

This is the master template — **do not build client sites in this folder**.
Copy it to `D:\Work\<client-slug>` first (skip `node_modules` if present).

## New client checklist

1. **Copy** this folder to `D:\Work\<client-slug>`.
2. **Configure** `lib/site.ts` — name, tagline, owner, phone (digits for wa.me),
   email, address, description, footer blurb, hero headline/sub/image.
   Update `.env` (ADMIN_PASSWORD, SESSION_SECRET) and `package.json` name.
3. **Theme** — colours are CSS variables at the top of `app/globals.css`
   (`--color-ultra` = primary, `--color-plate` = dark hero bg, `--color-gold` =
   accent, plus paper/tint/ink neutrals). Fonts: `--font-display` / `--font-body`.
4. **Data** — drop images and/or scrape into `intake/` (see `intake/README.md`), then:
   ```
   npm install
   node scripts/build-from-intake.mjs
   # enrich names/blurbs/prices in prisma/seed-data.json
   npm run db:seed
   npm run dev
   ```

## Structure

- Taxonomy: Collection → Category → Subcategory → Product (+ tags).
  Route: `app/[collection]/[[...slug]]` gives shareable nested URLs.
- Admin at `/admin` (password from `.env`), uploads served via `app/uploads/[filename]`.
- Seed pipeline: `intake/` → `scripts/build-from-intake.mjs` → `prisma/seed-data.json`
  → `npm run db:seed`.
