import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { BreadcrumbSchema } from "@/components/SchemaOrg";
import { ArrowRight, Check, Sun, Wind, Battery, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Solar & Wind Farm Transformers | FluxCo - Renewable Energy Solutions",
  description:
    "Transformers for solar farms, wind turbines, and battery storage: step-up transformers, collector substations, and grid interconnection. DOE compliant, fast delivery.",
  keywords: [
    "solar farm transformer",
    "wind turbine transformer",
    "renewable energy transformer",
    "collector substation transformer",
    "BESS transformer",
    "battery storage transformer",
    "inverter transformer",
    "grid interconnection transformer",
  ],
  openGraph: {
    title: "Renewable Energy Transformers | FluxCo",
    description:
      "Transformers for solar farms, wind turbines, and battery storage. Fast delivery and DOE compliance.",
    type: "website",
  },
};

const benefits = [
  {
    icon: Sun,
    title: "Solar Integration",
    description:
      "Inverter step-up, collector substations, and POI transformers for utility-scale solar.",
  },
  {
    icon: Wind,
    title: "Wind Power",
    description:
      "Nacelle and pad-mount transformers engineered for wind turbine applications.",
  },
  {
    icon: Battery,
    title: "Energy Storage",
    description:
      "BESS transformers rated for battery charge/discharge cycling and harmonics.",
  },
  {
    icon: Zap,
    title: "Grid Connect",
    description:
      "Main power transformers for grid interconnection at transmission voltages.",
  },
];

const solutions = [
  {
    title: "Inverter Step-Up Transformers",
    description:
      "Medium-voltage transformers located at each inverter skid. Typically 34.5 kV secondary for collector system.",
    products: ["Pad-mount transformers", "Dry-type transformers"],
    capacity: "2 MVA – 5 MVA per inverter",
  },
  {
    title: "Collector Substation",
    description:
      "Steps collector system voltage up to transmission level for grid interconnection.",
    products: ["Substation transformers", "Auto-transformers"],
    capacity: "50 MVA – 300+ MVA",
  },
  {
    title: "Wind Turbine Transformers",
    description:
      "Compact transformers designed for nacelle or base installation in wind turbines.",
    products: ["Dry-type transformers", "Pad-mount transformers"],
    capacity: "2 MVA – 6 MVA per turbine",
  },
  {
    title: "Battery Storage (BESS)",
    description:
      "Transformers rated for bidirectional power flow and high harmonic content from battery inverters.",
    products: ["Pad-mount transformers", "K-rated dry-type"],
    capacity: "1 MVA – 10 MVA per block",
  },
];

const projectTypes = [
  {
    name: "Utility-Scale Solar",
    description: "50 MW – 500+ MW solar farms requiring full procurement services",
  },
  {
    name: "Community Solar",
    description: "1 MW – 20 MW installations for distributed generation",
  },
  {
    name: "Wind Farms",
    description: "Onshore wind projects from 20 MW to 500+ MW",
  },
  {
    name: "Hybrid Projects",
    description: "Solar + storage and wind + storage combinations",
  },
];

export default function RenewableEnergyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Solutions", url: "https://fluxco.com/solutions" },
          { name: "Renewable Energy", url: "https://fluxco.com/solutions/renewable-energy" },
        ]}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-green-500/5 to-background">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Renewable Energy</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-green-600 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4">
                Clean Energy
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Solar, Wind & Storage Solutions
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Power the energy transition with transformers engineered for
                renewable generation. From inverter pads to grid interconnection,
                FluxCo supplies complete transformer packages for your project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Request Quote
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
                  <benefit.icon className="w-8 h-8 text-green-600 mb-3" />
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
            Renewable projects have unique requirements for each stage of power
            collection and grid interconnection.
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

      {/* Project Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl text-foreground mb-6">
                Project Types We Support
              </h2>
              <div className="space-y-4">
                {projectTypes.map((project) => (
                  <div
                    key={project.name}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {project.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="font-display text-xl text-foreground mb-4">
                Why FluxCo for Renewables
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Volume Pricing</p>
                    <p className="text-muted-foreground text-sm">
                      Competitive pricing for multiple units across your project.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Staged Delivery</p>
                    <p className="text-muted-foreground text-sm">
                      Coordinate deliveries with your construction schedule.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">DOE Compliance</p>
                    <p className="text-muted-foreground text-sm">
                      All units meet current DOE efficiency standards.
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
              href="/transformers/padmount"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Padmount Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Ideal for inverter step-up and BESS applications.
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
                Grid interconnection and collector substations.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link
              href="/transformers/dry-type"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Dry-Type Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Wind turbine nacelle and base installations.
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
