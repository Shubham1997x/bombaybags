// Builds a draft prisma/seed-data.json from the intake/ folder.
//
// Sources (either or both):
//   intake/images/<Collection>/<Category>/*.{jpg,jpeg,png,webp}
//     - WhatsApp-downloaded product photos, sorted into folders by hand.
//     - Files directly under <Collection>/ get category = collection name.
//     - Product name is derived from the file name (dashes/underscores → spaces,
//       title-cased). "IMG-20260101-WA0012.jpg" style names become "Product 1",
//       "Product 2", … within their category — rename files for better names,
//       or let Claude enrich the draft afterwards.
//   intake/scraped/products-raw.json
//     - Firecrawl output, normalized to an array of:
//       { name, collection?, category, subcategory?, price?, description?, images: [url|path, ...] }
//     - Remote image URLs are downloaded into public/uploads.
//
// Output: prisma/seed-data.json (overwrites). Images land in public/uploads/.
// After running, review/enrich names + blurbs, then: npm run db:seed

import { readFile, writeFile, mkdir, readdir, copyFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const intakeImages = path.join(root, "intake", "images");
const scrapedFile = path.join(root, "intake", "scraped", "products-raw.json");
const uploadsDir = path.join(root, "public", "uploads");
const outFile = path.join(root, "prisma", "seed-data.json");

const IMG_EXT = /\.(jpe?g|png|webp)$/i;

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(input) {
  return String(input)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// WhatsApp auto-names like IMG-20260101-WA0012 carry no product info.
function isJunkName(base) {
  return /^(img|image|photo|pic|whatsapp|wa|screenshot)[-_ ]?\d*/i.test(base) || /^\d+$/.test(base);
}

const collections = new Map(); // name -> { categories: Map(name -> Set(subcategory)) }
const products = [];
const usedSlugs = new Set();

function uniqueSlug(base) {
  let slug = slugify(base) || "product";
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${slugify(base)}-${n++}`;
  usedSlugs.add(slug);
  return slug;
}

function registerTaxonomy(collection, category, subcategory) {
  if (!collections.has(collection)) collections.set(collection, new Map());
  const cats = collections.get(collection);
  if (!cats.has(category)) cats.set(category, new Set());
  if (subcategory) cats.get(category).add(subcategory);
}

async function walkImages() {
  if (!existsSync(intakeImages)) return;
  const collectionDirs = (await readdir(intakeImages, { withFileTypes: true })).filter((d) =>
    d.isDirectory()
  );
  for (const colDir of collectionDirs) {
    const collection = titleCase(colDir.name);
    const colPath = path.join(intakeImages, colDir.name);
    const entries = await readdir(colPath, { withFileTypes: true });

    const groups = [];
    // Loose files directly under the collection folder → category named after collection.
    const looseFiles = entries.filter((e) => e.isFile() && IMG_EXT.test(e.name));
    if (looseFiles.length > 0) groups.push({ category: collection, dir: colPath, files: looseFiles });
    for (const catDir of entries.filter((e) => e.isDirectory())) {
      const catPath = path.join(colPath, catDir.name);
      const files = (await readdir(catPath, { withFileTypes: true })).filter(
        (e) => e.isFile() && IMG_EXT.test(e.name)
      );
      if (files.length > 0) groups.push({ category: titleCase(catDir.name), dir: catPath, files });
    }

    for (const group of groups) {
      registerTaxonomy(collection, group.category, null);
      let counter = 1;
      for (const file of group.files) {
        const base = file.name.replace(IMG_EXT, "");
        const rawName = isJunkName(base) ? `${group.category} Product ${counter}` : titleCase(base);
        counter++;
        const slug = uniqueSlug(rawName);
        const ext = path.extname(file.name).toLowerCase();
        const destName = `${slug}${ext}`;
        await copyFile(path.join(group.dir, file.name), path.join(uploadsDir, destName));
        products.push({
          slug,
          name: rawName,
          blurb: "",
          collection,
          category: group.category,
          subcategory: null,
          price: null,
          image: `/uploads/${destName}`,
          images: [`/uploads/${destName}`],
          tags: [],
        });
      }
    }
  }
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function ingestScraped() {
  if (!existsSync(scrapedFile)) return;
  const raw = JSON.parse(await readFile(scrapedFile, "utf-8"));
  const items = Array.isArray(raw) ? raw : raw.products ?? [];
  for (const item of items) {
    if (!item?.name) continue;
    const collection = titleCase(item.collection || "Catalogue");
    const category = titleCase(item.category || collection);
    const subcategory = item.subcategory ? titleCase(item.subcategory) : null;
    registerTaxonomy(collection, category, subcategory);
    const slug = uniqueSlug(item.name);
    const sources = (item.images ?? []).filter(Boolean);
    const localImages = [];
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const extMatch = String(src).match(IMG_EXT);
      const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";
      const destName = i === 0 ? `${slug}${ext}` : `${slug}-${i + 1}${ext}`;
      const destPath = path.join(uploadsDir, destName);
      try {
        if (/^https?:\/\//.test(src)) await downloadImage(src, destPath);
        else await copyFile(path.join(root, "intake", src), destPath);
        localImages.push(`/uploads/${destName}`);
      } catch (err) {
        console.warn(`  ! image failed for "${item.name}": ${src} (${err.message})`);
      }
    }
    const name = item.name === item.name.toLowerCase() ? titleCase(item.name) : item.name;
    products.push({
      slug,
      name,
      blurb: item.description ? String(item.description).slice(0, 200) : "",
      description: item.description ? String(item.description) : "",
      collection,
      category,
      subcategory,
      price: typeof item.price === "number" ? item.price : null,
      image: localImages[0] ?? "",
      images: localImages,
      tags: [],
    });
  }
}

async function main() {
  await mkdir(uploadsDir, { recursive: true });
  await walkImages();
  await ingestScraped();

  if (products.length === 0) {
    console.error(
      "No products found. Put images in intake/images/<Collection>/<Category>/ or Firecrawl JSON at intake/scraped/products-raw.json"
    );
    process.exit(1);
  }

  const seedData = {
    collections: [...collections.keys()],
    categories: [...collections.entries()].flatMap(([collection, cats]) =>
      [...cats.entries()].map(([name, subs]) => ({
        name,
        collection,
        subcategories: [...subs],
      }))
    ),
    products,
  };

  await writeFile(outFile, JSON.stringify(seedData, null, 2));
  console.log(
    `Wrote ${outFile}: ${seedData.collections.length} collections, ${seedData.categories.length} categories, ${products.length} products.`
  );
  console.log("Next: enrich names/blurbs in prisma/seed-data.json, then run: npm run db:seed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
