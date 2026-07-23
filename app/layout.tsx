import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
