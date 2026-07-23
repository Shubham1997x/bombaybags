import { prisma } from "@/lib/db";

export type CatalogSubcategory = {
  id: number;
  name: string;
  slug: string;
};

export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  collectionId: number;
  collectionName: string;
  collectionSlug: string;
  subcategories: CatalogSubcategory[];
};

export type CatalogCollection = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  description: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  collectionId: number;
  collectionName: string;
  collectionSlug: string;
  subcategoryId: number | null;
  subcategoryName: string | null;
  subcategorySlug: string | null;
  price: number | null;
  priceUnit: string;
  image: string;
  images: string[];
  tags: string[];
};

export type CatalogData = {
  collections: CatalogCollection[];
  categories: CatalogCategory[];
  products: CatalogProduct[];
};

export async function getCatalog(): Promise<CatalogData> {
  const [collections, categories, products] = await Promise.all([
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        collection: true,
        subcategories: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        category: { include: { collection: true } },
        subcategory: true,
        images: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    }),
  ]);

  return {
    collections: collections.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      image: s.image ?? products.find((p) => p.category.collectionId === s.id && p.image)?.image ?? null,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      collectionId: c.collectionId,
      collectionName: c.collection.name,
      collectionSlug: c.collection.slug,
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
      })),
    })),
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      blurb: p.blurb,
      description: p.description,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      collectionId: p.category.collectionId,
      collectionName: p.category.collection.name,
      collectionSlug: p.category.collection.slug,
      subcategoryId: p.subcategoryId,
      subcategoryName: p.subcategory?.name ?? null,
      subcategorySlug: p.subcategory?.slug ?? null,
      price: p.price,
      priceUnit: p.priceUnit,
      image: p.image,
      images: p.images.map((img) => img.url),
      tags: p.tags.map((t) => t.tag.name),
    })),
  };
}
