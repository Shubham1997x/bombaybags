import { notFound } from "next/navigation";

import { getCatalog } from "@/lib/catalog";
import { Nav } from "@/components/nav";
import { CatalogPage } from "@/components/catalog-page";
import { Footer } from "@/components/footer";
import { StickyBar } from "@/components/sticky-bar";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string; slug?: string[] }>;
}) {
  const { collection: collectionSlug, slug = [] } = await params;
  const data = await getCatalog();

  const collection = data.collections.find((s) => s.slug === collectionSlug);
  if (!collection) notFound();

  const collectionCategories = data.categories.filter((c) => c.collectionId === collection.id);

  const [categorySlug, subcategorySlug] = slug;

  const category = categorySlug ? collectionCategories.find((c) => c.slug === categorySlug) : undefined;
  if (categorySlug && !category) notFound();

  const subcategory = subcategorySlug
    ? category?.subcategories.find((s) => s.slug === subcategorySlug)
    : undefined;
  if (subcategorySlug && !subcategory) notFound();

  const scopedData = {
    collections: data.collections,
    categories: collectionCategories,
    products: data.products.filter((p) => p.collectionId === collection.id),
  };

  return (
    <>
      <Nav />
      <main>
        <CatalogPage
          key={`${collectionSlug}/${categorySlug ?? ""}/${subcategorySlug ?? ""}`}
          initialData={scopedData}
          basePath={`/${collectionSlug}`}
          initialCategoryId={category?.id ?? null}
          initialSubcategoryId={subcategory?.id ?? null}
        />
      </main>
      <Footer />
      <StickyBar />
      <FloatingWhatsapp />
      <Toaster />
    </>
  );
}
