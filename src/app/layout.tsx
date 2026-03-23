import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { OrganizationSchema, WebSiteSchema } from "@/components/SchemaOrg";

export const metadata: Metadata = {
  metadataBase: new URL("https://fluxco.com"),
  title: {
    default: "FluxCo | One Call. Global Power. | Procurement, Leasing & Service",
    template: "%s | FluxCo",
  },
  description:
    "One Call. Global Power. Procurement, leasing, service and warranty for padmount, substation, and distribution transformers from 100+ global suppliers. DOE 2027 compliant.",
  keywords: [
    "transformer procurement",
    "transformer leasing",
    "transformer service",
    "transformer warranty",
    "padmount transformer for sale",
    "substation transformer supplier",
    "distribution transformer for sale",
    "power transformer broker",
    "transformer marketplace",
    "transformer RFQ",
    "in-stock transformers",
    "DOE 2027 compliant transformers",
    "FEOC compliant transformers",
    "transformer procurement services",
    "data center transformers",
    "renewable energy transformers",
    "transformer lead times",
    "Made in USA transformers",
  ],
  openGraph: {
    title: "FluxCo | One Call. Global Power.",
    description:
      "Procurement, leasing, service and warranty for padmount, substation, and distribution transformers from 100+ global suppliers.",
    type: "website",
    locale: "en_US",
    siteName: "FluxCo",
    url: "https://fluxco.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxCo | One Call. Global Power.",
    description:
      "Procurement, leasing, service and warranty for transformers from 100+ global suppliers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://fluxco.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <OrganizationSchema />
        <WebSiteSchema />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
