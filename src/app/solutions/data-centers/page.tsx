import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { BreadcrumbSchema } from "@/components/SchemaOrg";
import { ArrowRight, Check, Server, Zap, Shield, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Center Transformers | FluxCo - Power Infrastructure Solutions",
  description:
    "Transformer solutions for data centers: padmount, dry-type, and substation transformers from 500 kVA to 100+ MVA. Fast lead times and redundant configurations.",
  keywords: [
    "data center transformer",
    "data center power infrastructure",
    "hyperscale transformer",
    "colocation transformer",
    "data center electrical",
    "UPS transformer",
    "medium voltage transformer data center",
  ],
  openGraph: {
    title: "Data Center Transformers | FluxCo",
    description:
      "Transformer solutions for data centers from 500 kVA to 100+ MVA. Fast lead times and turnkey delivery.",
    type: "website",
  },
};

const benefits = [
  {
    icon: Zap,
    title: "High Capacity",
    description:
      "Transformers sized for hyperscale demands—from 500 kVA to 100+ MVA per unit.",
  },
  {
    icon: Clock,
    title: "Fast Deployment",
    description:
      "In-stock inventory and expedited manufacturing to meet aggressive schedules.",
  },
  {
    icon: Shield,
    title: "Redundancy Ready",
    description:
      "N+1, 2N, and 2N+1 configurations with matched units for parallel operation.",
  },
  {
    icon: Server,
    title: "Complete Solution",
    description:
      "Full-service support from site assessment through commissioning and testing.",
  },
];

const solutions = [
  {
    title: "Utility Service Entrance",
    products: ["Substation transformers", "Pad-mount transformers"],
    description:
      "Primary power delivery from utility grid to your facility. Medium voltage transformation with redundant feeds.",
    capacity: "10 MVA – 100+ MVA",
  },
  {
    title: "UPS Input Transformers",
    products: ["Dry-type transformers", "K-rated transformers"],
    description:
      "Step-down transformers feeding UPS systems. K-factor rated for harmonic-rich loads.",
    capacity: "500 kVA – 5 MVA",
  },
  {
    title: "PDU Transformers",
    products: ["Dry-type transformers", "Low-voltage transformers"],
    description:
      "Distribution to power distribution units. Compact footprint for raised floor environments.",
    capacity: "75 kVA – 1 MVA",
  },
  {
    title: "Generator Output",
    products: ["Dry-type transformers", "Step-up transformers"],
    description:
      "Voltage matching between backup generators and facility distribution.",
    capacity: "500 kVA – 10 MVA",
  },
];

const challenges = [
  "Extended lead times impacting project schedules",
  "Finding matched units for redundant configurations",
  "Coordinating multiple vendors for complete solutions",
  "Meeting efficiency requirements for PUE targets",
  "Space constraints in existing facilities",
];

export default function DataCentersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Solutions", url: "https://fluxco.com/solutions" },
          { name: "Data Centers", url: "https://fluxco.com/solutions/data-centers" },
        ]}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Data Centers</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4">
                Industry Solution
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Data Center Power Infrastructure
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Power your hyperscale, colocation, or enterprise data center
                with transformers engineered for uptime. From utility entrance
                to rack-level distribution, FluxCo delivers complete solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Request Consultation
                </Link>
                <Link
                  href="/inventory"
                  className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:border-primary/50 transition-colors"
                >
                  View Inventory
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <benefit.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-medium text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-4">
            Transformer Solutions by Application
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Every layer of data center power infrastructure requires different
            transformer specifications. We provide solutions for each stage.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution) => (
              <div
                key={solution.title}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h3 className="font-display text-xl text-foreground mb-2">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {solution.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {solution.products.map((product) => (
                    <span
                      key={product}
                      className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded"
                    >
                      {product}
                    </span>
                  ))}
                </div>
                <p className="text-primary text-sm font-medium">
                  Typical capacity: {solution.capacity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl text-foreground mb-6">
                Challenges We Solve
              </h2>
              <ul className="space-y-4">
                {challenges.map((challenge) => (
                  <li key={challenge} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="font-display text-xl text-foreground mb-4">
                Why FluxCo for Data Centers
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Single Source</p>
                    <p className="text-muted-foreground text-sm">
                      One partner for all transformer types across your facility.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Speed to Site</p>
                    <p className="text-muted-foreground text-sm">
                      Stock inventory and expedited options for critical paths.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Turnkey Delivery</p>
                    <p className="text-muted-foreground text-sm">
                      Engineering through commissioning for turnkey delivery.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Recommended Products
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/transformers/dry-type"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Dry-Type Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Ideal for indoor installations near IT equipment.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link
              href="/transformers/padmount"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Padmount Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Outdoor service entrance for campus facilities.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link
              href="/transformers/substation"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Substation Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                High-capacity units for hyperscale facilities.
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
