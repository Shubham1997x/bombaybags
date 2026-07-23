// ============================================================
// SITE CONFIG — the ONLY file to edit for a new client.
// Everything on the site (branding, contact, WhatsApp, SEO)
// reads from here. Theme colours live in app/globals.css.
// ============================================================
export const site = {
  name: "Bombay Bags",
  tagline: "Bags, Backpacks & Promotional Merchandise, Made in Mumbai",
  owner: "Lara Enterprises",
  phone: "+91 79493 40120",
  phoneDigits: "917949340120", // country code + number, digits only (used for wa.me links)
  email: "info@bombaybagsco.co.in",
  address:
    "Ground, Shop No 9, Abhinav Apartment, Eraniwadi Road No. 3, Kandivali West, Mumbai - 400067, Maharashtra, India",
  description:
    "Bombay Bags (Lara Enterprises) manufactures and supplies promotional backpacks, tote bags, drawstring bags, jute bags and corporate gifting merchandise — browse the full range and enquire directly on WhatsApp.",
  // Short 2–3 line blurb shown in the footer under the brand name.
  footerBlurb:
    "Manufacturer of promotional bags, backpacks and corporate gifting merchandise since 2022 — browse the catalogue and reach us directly on WhatsApp for bulk pricing.",
  // Hero section (homepage banner).
  heroHeadline: "Promotional Bags, Made to Order.",
  heroSub:
    "Backpacks, totes, drawstring bags & corporate gifting — browse our full range and get the best bulk price directly on WhatsApp.",
  // Full-width hero background image (Unsplash URL or /uploads/... path).
  heroImage:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1920&q=80",
};

export function waLink(message?: string) {
  const base = `https://wa.me/${site.phoneDigits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function productWaLink(productName: string) {
  return waLink(
    `Hi ${site.name}, I'm interested in "${productName}". Could you share more details and pricing?`
  );
}

export function buildBulkWaLink(
  items: Array<{ name: string; qty: number; price: number | null; priceUnit: string }>
) {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. ${item.name} — qty ${item.qty}${
        item.price != null ? ` (₹${item.price.toLocaleString("en-IN")}/${item.priceUnit})` : ""
      }`
  );
  return waLink(
    `Hi ${site.name}, I'd like a quote for:\n${lines.join("\n")}\n\nCould you share pricing and availability?`
  );
}

export function telLink() {
  return `tel:${site.phoneDigits}`;
}
