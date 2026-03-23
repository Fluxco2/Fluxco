import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { BreadcrumbSchema, ProductSchema, FAQSchema } from "@/components/SchemaOrg";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Substation Transformers | FluxCo - Power Transformers 10-500+ MVA",
  description:
    "Buy substation and power transformers from 10 MVA to 500+ MVA. Auto-transformers, two-winding, and step-up/step-down configurations. Expert engineering and procurement services.",
  keywords: [
    "substation transformer",
    "power transformer",
    "substation transformer for sale",
    "auto transformer",
    "step up transformer",
    "step down transformer",
    "utility transformer",
    "grid transformer",
  ],
  openGraph: {
    title: "Substation Transformers | FluxCo",
    description:
      "Buy substation and power transformers from 10 MVA to 500+ MVA. Expert engineering and procurement services.",
    type: "website",
  },
};

const specifications = [
  { label: "Capacity Range", value: "10 MVA – 500+ MVA" },
  { label: "Primary Voltage", value: "69 kV – 500 kV" },
  { label: "Secondary Voltage", value: "4.16 kV – 138 kV" },
  { label: "Configurations", value: "Auto, Two-Winding, Three-Winding" },
  { label: "Cooling", value: "ONAN/ONAF/OFAF/ODAF" },
  { label: "Tap Changer", value: "OLTC & DETC Available" },
  { label: "Standards", value: "IEEE C57.12.00, IEC 60076" },
  { label: "BIL Ratings", value: "350 kV – 1800 kV" },
];

const features = [
  "Custom voltage ratios and MVA ratings",
  "On-load tap changers (OLTC) for voltage regulation",
  "Multiple cooling stages for peak load handling",
  "Advanced monitoring and protection systems",
  "Seismic qualification available",
  "Sound reduction enclosures",
  "Fire-resistant designs",
  "Factory acceptance testing included",
];

const applications = [
  {
    title: "Utility Substations",
    description:
      "Transmission and distribution substations requiring high-capacity voltage transformation.",
  },
  {
    title: "Power Generation",
    description:
      "Step-up transformers for conventional, nuclear, and renewable power plants.",
  },
  {
    title: "Heavy Industry",
    description:
      "Steel mills, mining operations, and large manufacturing facilities.",
  },
  {
    title: "Data Centers",
    description:
      "High-capacity power infrastructure for hyperscale data center campuses.",
  },
];

const faqs = [
  {
    question: "What is the difference between a substation and distribution transformer?",
    answer:
      "Substation transformers are larger (typically 10+ MVA) and handle higher voltages (69kV+) for bulk power transmission. Distribution transformers are smaller and step voltage down for end-user delivery.",
  },
  {
    question: "What is an auto-transformer?",
    answer:
      "An auto-transformer uses a single winding with a tap point, sharing part of the winding between primary and secondary. They are more compact and efficient for smaller voltage ratios but provide less isolation than two-winding designs.",
  },
  {
    question: "Can you provide engineering and installation services?",
    answer:
      "Yes, FluxCo offers complete project management services including site assessment, foundation design, equipment specification, installation, testing, and commissioning.",
  },
  {
    question: "What is the typical lead time for a custom substation transformer?",
    answer:
      "Custom substation transformers typically require 40-60 weeks depending on specifications, capacity, and manufacturer capacity. Emergency and expedited options may be available.",
  },
];

export default function SubstationPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Transformers", url: "https://fluxco.com/transformers" },
          { name: "Substation", url: "https://fluxco.com/transformers/substation" },
        ]}
      />
      <ProductSchema
        name="Substation Transformers"
        description="High-capacity power transformers for utility substations and industrial facilities. 10 MVA to 500+ MVA."
        category="Electrical Transformers"
        url="https://fluxco.com/transformers/substation"
      />
      <FAQSchema items={faqs} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/transformers"
              className="hover:text-primary transition-colors"
            >
              Transformers
            </Link>
            <span>/</span>
            <span className="text-foreground">Substation</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-foreground text-background text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4">
                High Capacity
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Substation Transformers
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                High-capacity power transformers engineered for utility
                substations, power plants, and large industrial facilities.
                Custom designs from 10 MVA to 500+ MVA with full procurement services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/inventory?type=substation"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  View Inventory
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:border-primary/50 transition-colors"
                >
                  Request Quote
                </Link>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 border border-border">
              <h3 className="font-display text-xl text-foreground mb-4">
                Quick Specs
              </h3>
              <dl className="space-y-3">
                {specifications.slice(0, 5).map((spec) => (
                  <div key={spec.label} className="flex justify-between">
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-foreground font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Full Specifications */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Technical Specifications
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specifications.map((spec) => (
              <div
                key={spec.label}
                className="bg-card border border-border rounded-xl p-6"
              >
                <dt className="text-muted-foreground text-sm mb-1">
                  {spec.label}
                </dt>
                <dd className="text-foreground font-display text-lg">
                  {spec.value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl text-foreground mb-6">
                Capabilities & Features
              </h2>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl text-foreground mb-6">
                Applications
              </h2>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.title}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <h3 className="font-medium text-foreground mb-1">
                      {app.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {app.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h3 className="font-medium text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Related Products
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/transformers/padmount"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Padmount Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Ground-level units for underground distribution systems.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link
              href="/transformers/distribution"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Distribution Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Pole-mount and platform units for utility distribution.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link
              href="/solutions/data-centers"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Data Center Solutions
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                High-capacity power infrastructure for data centers.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}
