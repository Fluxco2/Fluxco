import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { BreadcrumbSchema, ProductSchema } from "@/components/SchemaOrg";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Transformers | FluxCo - Padmount, Substation, Distribution & Dry Type",
  description:
    "Browse our complete transformer inventory. Padmount, substation, distribution, and dry-type transformers from 25 kVA to 500 MVA. In-stock with fast delivery.",
  keywords: [
    "transformers",
    "buy transformers",
    "transformer supplier",
    "padmount transformer",
    "substation transformer",
    "distribution transformer",
    "dry type transformer",
  ],
  openGraph: {
    title: "Transformers | FluxCo",
    description:
      "Browse our complete transformer inventory. Padmount, substation, distribution, and dry-type transformers.",
    type: "website",
  },
};

const categories = [
  {
    name: "Padmount Transformers",
    slug: "padmount",
    description:
      "Ground-level transformers for underground distribution systems. Perfect for commercial, residential, and institutional applications.",
    specs: ["75 kVA – 10 MVA", "Single & Three Phase", "Dead-front Design"],
    tag: "Most Popular",
    tagColor: "bg-primary",
  },
  {
    name: "Substation Transformers",
    slug: "substation",
    description:
      "High-capacity power transformers for utility substations, industrial facilities, and large commercial installations.",
    specs: ["10 MVA – 500 MVA+", "Auto & Two-Winding", "Custom Voltage Classes"],
    tag: "High Capacity",
    tagColor: "bg-foreground",
  },
  {
    name: "Distribution Transformers",
    slug: "distribution",
    description:
      "Reliable pole-mount and platform units for utility distribution networks. Conventional and CSP designs available.",
    specs: ["25 kVA – 2.5 MVA", "Pole-mount & Platform", "Conventional & CSP"],
    tag: "Utility Standard",
    tagColor: "bg-accent",
  },
  {
    name: "Dry-Type Transformers",
    slug: "dry-type",
    description:
      "Air-cooled transformers ideal for indoor installations, sensitive environments, and locations where fire safety is critical.",
    specs: ["15 kVA – 30 MVA", "Cast Resin & VPI", "Indoor & Outdoor"],
    tag: "No Oil Required",
    tagColor: "bg-green-600",
  },
];

export default function TransformersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Transformers", url: "https://fluxco.com/transformers" },
        ]}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Product Catalog
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-4 mb-6">
              Transformers for Every Application
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              From compact distribution units to massive power transformers,
              FluxCo connects you with the right equipment from our global
              network of manufacturers.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/transformers/${category.slug}`}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <ProductSchema
                  name={category.name}
                  description={category.description}
                  category="Electrical Transformers"
                  url={`https://fluxco.com/transformers/${category.slug}`}
                />
                <span
                  className={`inline-block ${category.tagColor} text-white text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4`}
                >
                  {category.tag}
                </span>
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {category.name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {category.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {category.specs.map((spec) => (
                    <li
                      key={spec}
                      className="flex items-center gap-2 text-steel text-sm"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {spec}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-300">
                  View Options <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Our engineering team can help you select the right transformer for
            your project. Tell us your requirements and we&apos;ll provide options
            with pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/specbuilder"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              AI Spec Builder
            </Link>
            <Link
              href="/inventory"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:border-primary/50 transition-colors"
            >
              Browse Inventory
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}
