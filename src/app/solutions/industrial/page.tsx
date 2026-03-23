import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { BreadcrumbSchema } from "@/components/SchemaOrg";
import { ArrowRight, Check, Factory, Hammer, Pickaxe, Droplets } from "lucide-react";

export const metadata: Metadata = {
  title: "Industrial Transformers | FluxCo - Manufacturing & Heavy Industry",
  description:
    "Transformers for manufacturing, mining, oil & gas, and heavy industry: rectifier transformers, furnace transformers, and process power. Custom designs for demanding applications.",
  keywords: [
    "industrial transformer",
    "manufacturing transformer",
    "rectifier transformer",
    "furnace transformer",
    "mining transformer",
    "oil and gas transformer",
    "process transformer",
    "heavy industry transformer",
  ],
  openGraph: {
    title: "Industrial Transformers | FluxCo",
    description:
      "Transformers for manufacturing, mining, oil & gas, and heavy industry. Custom designs available.",
    type: "website",
  },
};

const benefits = [
  {
    icon: Factory,
    title: "Manufacturing",
    description:
      "Motor loads, process equipment, and plant distribution for factories and assembly plants.",
  },
  {
    icon: Pickaxe,
    title: "Mining",
    description:
      "Rugged transformers for surface and underground mining operations.",
  },
  {
    icon: Droplets,
    title: "Oil & Gas",
    description:
      "Hazardous area rated transformers for refineries, pipelines, and drilling.",
  },
  {
    icon: Hammer,
    title: "Heavy Industry",
    description:
      "Steel mills, foundries, and metal processing with specialized transformer needs.",
  },
];

const solutions = [
  {
    title: "Plant Distribution",
    description:
      "Primary and secondary distribution for manufacturing facilities. Utility service entrance through shop floor.",
    products: ["Pad-mount transformers", "Dry-type transformers", "Substation transformers"],
    capacity: "500 kVA – 50+ MVA",
  },
  {
    title: "Motor Starting & VFD",
    description:
      "Transformers feeding large motors and variable frequency drives. K-rated options for harmonic mitigation.",
    products: ["Dry-type transformers", "K-rated transformers"],
    capacity: "100 kVA – 5 MVA",
  },
  {
    title: "Rectifier Transformers",
    description:
      "DC power for electrochemical processes, plating, and aluminum smelting. Phase-shift windings for harmonic cancellation.",
    products: ["Custom rectifier transformers"],
    capacity: "500 kVA – 100+ MVA",
  },
  {
    title: "Furnace Transformers",
    description:
      "Electric arc furnaces and induction furnaces for steel and metal processing. High current, low voltage secondaries.",
    products: ["Custom furnace transformers"],
    capacity: "5 MVA – 200+ MVA",
  },
];

const industries = [
  {
    name: "Automotive Manufacturing",
    description: "Assembly plants, paint shops, stamping facilities",
  },
  {
    name: "Food & Beverage",
    description: "Processing plants, cold storage, bottling facilities",
  },
  {
    name: "Pulp & Paper",
    description: "Paper mills and converting operations",
  },
  {
    name: "Chemical Processing",
    description: "Petrochemical plants, pharmaceutical manufacturing",
  },
  {
    name: "Mining Operations",
    description: "Open pit, underground, and processing facilities",
  },
  {
    name: "Oil & Gas",
    description: "Refineries, pipelines, offshore platforms",
  },
];

export default function IndustrialPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Solutions", url: "https://fluxco.com/solutions" },
          { name: "Industrial", url: "https://fluxco.com/solutions/industrial" },
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
            <span className="text-foreground">Industrial</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-foreground text-background text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4">
                Heavy Industry
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Industrial Power Solutions
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                From standard plant distribution to custom furnace and rectifier
                transformers, FluxCo delivers power solutions for the most
                demanding industrial applications.
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
            Solutions by Application
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Industrial facilities have diverse power requirements from standard
            distribution to highly specialized process transformers.
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

      {/* Industries Served */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Industries We Serve
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className="flex items-start gap-3"
              >
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{industry.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {industry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl text-foreground mb-6">
                Industrial Capabilities
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Custom Engineering
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Specialized designs for rectifiers, furnaces, and unique
                      industrial processes.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Hazardous Area Ratings
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Class I Division 1 & 2, Zone 1 & 2 certified units for
                      explosive environments.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      High Capacity
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Transformers up to 200+ MVA for the largest industrial
                      loads.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Harsh Environments
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Corrosion resistant, extreme temperature, and seismic
                      qualified options.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Turnkey Delivery
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Complete installation and commissioning services for
                      industrial sites.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="font-display text-xl text-foreground mb-4">
                Specialty Transformers
              </h3>
              <p className="text-muted-foreground mb-6">
                Beyond standard distribution, we supply specialty industrial
                transformers:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-foreground">
                    Rectifier transformers (6, 12, 24 pulse)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-foreground">
                    Electric arc furnace transformers
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-foreground">
                    Induction furnace transformers
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-foreground">
                    Drive isolation transformers
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-foreground">
                    Phase-shifting transformers
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-foreground">
                    Mining duty transformers
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Recommended Products
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/transformers/substation"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                Substation Transformers
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                High-capacity units for plant main substations.
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
                Indoor distribution and VFD/motor applications.
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
                Outdoor distribution across industrial campuses.
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
