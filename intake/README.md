# Intake folder — drop client product data here

Two sources, use either or both:

## 1. WhatsApp / manual images

Sort downloaded product photos into folders:

```
intake/images/<Collection>/<Category>/photo1.jpg
intake/images/<Collection>/<Category>/photo2.jpg
```

- Folder names become the site taxonomy (e.g. `Cricket/Batting Gloves`, `Sofas/3 Seater`).
- For a small catalogue, one collection folder is fine: `intake/images/Furniture/Sofas/*.jpg`.
- Rename image files to the product name where possible (`royal-oak-dining-table.jpg`).
  WhatsApp auto-names (`IMG-2026...-WA0012.jpg`) get placeholder names that Claude
  enriches from the images afterwards.

## 2. Firecrawl scrape

Save the normalized scrape at `intake/scraped/products-raw.json` as an array of:

```json
{
  "name": "Product Name",
  "collection": "Optional Collection",
  "category": "Category Name",
  "subcategory": "Optional",
  "price": 1499,
  "description": "optional text",
  "images": ["https://... or relative path inside intake/"]
}
```

## Then

```
node scripts/build-from-intake.mjs   # → prisma/seed-data.json + public/uploads/
# review/enrich names & blurbs in prisma/seed-data.json
npm run db:seed
```
