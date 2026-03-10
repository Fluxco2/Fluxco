import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { BreadcrumbSchema, FAQSchema } from "@/components/SchemaOrg";

export const metadata: Metadata = {
  title: "Transformer FAQ | FluxCo - Common Questions Answered",
  description:
    "Frequently asked questions about buying transformers: lead times, pricing, specifications, DOE compliance, installation, and more. Get answers from transformer experts.",
  keywords: [
    "transformer FAQ",
    "transformer questions",
    "buy transformer",
    "transformer lead time",
    "transformer pricing",
    "DOE transformer",
    "transformer installation",
  ],
  openGraph: {
    title: "Transformer FAQ | FluxCo",
    description:
      "Frequently asked questions about buying transformers. Lead times, pricing, specifications, and more.",
    type: "website",
  },
};

const faqCategories = [
  {
    title: "Buying & Ordering",
    faqs: [
      {
        question: "What is the typical lead time for transformers?",
        answer:
          "It depends on what you need and what's available. New and refurbished units in stock at our partner stockyards can ship within 1-2 weeks. Units ready for refurbishment take 4-6 weeks. For new-build orders from American manufacturers, expect 16-28 weeks for distribution transformers and 40-60+ weeks for large power transformers. We always check stock first—it's usually the fastest and most cost-effective option.",
      },
      {
        question: "Do you have transformers in stock?",
        answer:
          "Yes. We partner with stockyards across the United States that maintain extensive transformer inventory. Our stock includes new units ready to ship, refurbished units that have been fully reconditioned, and units prepped and ready for refurbishment. New and refurbished in-stock units can ship within 1-2 weeks. Units requiring refurbishment typically take 4-6 weeks—still far faster than ordering new from a manufacturer.",
      },
      {
        question: "How do I request a quote?",
        answer:
          "You can request a quote through our contact form, AI Spec Builder, or by calling our sales team. Provide the kVA rating, primary and secondary voltages, phase configuration, and any special requirements. We typically respond within 24 business hours.",
      },
      {
        question: "What information do I need to provide for a quote?",
        answer:
          "At minimum: kVA rating, primary voltage, secondary voltage, and phase (single or three-phase). Helpful additions include: BIL rating, impedance requirements, tap configuration, cooling class, special testing, and delivery location.",
      },
      {
        question: "Do you offer financing or leasing options?",
        answer:
          "We work with financing partners who can provide lease and loan options for transformer purchases. Contact our sales team to discuss financing for your specific project.",
      },
      {
        question: "Are refurbished transformers reliable?",
        answer:
          "When done right, absolutely. Our partner stockyards follow rigorous refurbishment processes: full inspection, oil processing or replacement, winding testing, bushing replacement if needed, fresh paint, and comprehensive electrical testing. A properly refurbished transformer can provide decades of reliable service at 40-60% of new cost. We provide test reports and warranty coverage on all refurbished units. For many applications, refurbished is the smart choice—faster delivery, lower cost, and proven reliability.",
      },
      {
        question: "What's the difference between 'in stock' and 'ready for refurb'?",
        answer:
          "In-stock units are ready to ship immediately—either new or already refurbished. 'Ready for refurb' units are transformers our stockyard partners have acquired and inspected, confirmed to be good candidates for refurbishment, but haven't yet been through the full reconditioning process. These typically take 4-6 weeks to complete. The advantage: you're not waiting 6+ months for new manufacturing, and the unit has already been located and evaluated.",
      },
    ],
  },
  {
    title: "Technical Specifications",
    faqs: [
      {
        question: "What does DOE 2016 compliant mean?",
        answer:
          "DOE 2016 refers to the U.S. Department of Energy efficiency standards effective January 2016 (10 CFR 431). These standards set minimum efficiency levels for distribution transformers. All transformers we supply meet or exceed these requirements.",
      },
      {
        question: "What is the difference between padmount and substation transformers?",
        answer:
          "Padmount transformers are enclosed units installed at ground level, typically serving underground distribution systems (75 kVA - 10 MVA). Substation transformers are larger, open-air units used in utility substations and industrial facilities (10 MVA - 500+ MVA).",
      },
      {
        question: "When should I use a dry-type vs. oil-filled transformer?",
        answer:
          "Dry-type transformers are ideal for indoor installations, fire-sensitive areas, and locations where oil containment is impractical. Oil-filled transformers are typically more efficient and cost-effective for outdoor installations and larger capacities.",
      },
      {
        question: "What is a K-rated transformer?",
        answer:
          "K-rated transformers are designed to handle harmonic currents from non-linear loads like computers, VFDs, and LED lighting. K-4, K-13, and K-20 ratings indicate increasing ability to handle harmonics without overheating. Use K-rated units when feeding significant electronic loads.",
      },
      {
        question: "What is BIL and why does it matter?",
        answer:
          "BIL (Basic Impulse Level) indicates a transformer's ability to withstand voltage surges from lightning or switching. Higher BIL ratings provide better protection in areas with frequent lightning or where surge protection is critical. Standard BIL values are defined by IEEE based on voltage class.",
      },
      {
        question: "What voltage classes do you support?",
        answer:
          "We supply transformers for all standard voltage classes: low voltage (600V and below), medium voltage (2.4 kV - 35 kV), and high voltage (69 kV - 500 kV). Custom voltage configurations are available for special applications.",
      },
    ],
  },
  {
    title: "Services & Support",
    faqs: [
      {
        question: "Do you provide installation services?",
        answer:
          "Yes, through our EPC (Engineering, Procurement, Construction) services. We can handle everything from site assessment and foundation design through equipment installation, testing, and commissioning. Available for single units or complete substation projects.",
      },
      {
        question: "What engineering services do you offer?",
        answer:
          "Our engineering team provides: transformer sizing and selection, system studies (short circuit, coordination), protection scheme design, foundation and civil design, installation drawings, and commissioning procedures.",
      },
      {
        question: "Do you offer emergency or rush delivery?",
        answer:
          "Absolutely—this is where our stockyard network shines. We have eyes on transformer inventory across the country and can often locate a matching or compatible unit within hours. For true emergencies, we've shipped transformers within days. Refurbished units ready to go are often the fastest solution for emergency replacements. Call us directly for urgent situations—downtime is expensive and we move fast.",
      },
      {
        question: "What warranty do you provide?",
        answer:
          "Warranty terms vary by manufacturer and product type. Standard warranties typically range from 1-5 years covering manufacturing defects. Extended warranty options are available. Specific warranty details are provided with each quotation.",
      },
      {
        question: "Can you help with utility coordination?",
        answer:
          "Yes, we regularly assist customers with utility interconnection requirements, including equipment specifications, protection coordination, and metering. Our experience with utility requirements helps streamline the approval process.",
      },
    ],
  },
  {
    title: "Pricing & Costs",
    faqs: [
      {
        question: "What factors affect transformer pricing?",
        answer:
          "Key factors include: kVA rating (larger = more expensive), voltage class, efficiency level, special features (OLTC, special BIL), testing requirements, quantity, and delivery timeline. Custom designs cost more than standard configurations.",
      },
      {
        question: "Do you offer volume discounts?",
        answer:
          "Yes, we offer competitive pricing for multi-unit orders and ongoing supply agreements. Projects requiring multiple transformers (solar farms, data centers, etc.) benefit from volume pricing and coordinated delivery schedules.",
      },
      {
        question: "What is included in the price?",
        answer:
          "Standard pricing includes the transformer, factory testing, documentation, and shipping to your site. Options like field installation, special testing, extended warranties, and spare parts are quoted separately.",
      },
      {
        question: "How do you compare to buying direct from manufacturers?",
        answer:
          "We offer something manufacturers can't: speed and inventory visibility. Our stockyard network gives you access to transformers that are available now—new, refurbished, or ready for refurb—rather than waiting 6-12 months for new production. For new-build orders, we work with American manufacturers and can often match or beat direct pricing because we bring volume. The real value is optionality: we'll find you the fastest, most cost-effective path to getting your transformer, whether that's stock, refurb, or new.",
      },
    ],
  },
];

// Flatten FAQs for schema
const allFaqs = faqCategories.flatMap((category) => category.faqs);

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "FAQ", url: "https://fluxco.com/faq" },
        ]}
      />
      <FAQSchema items={allFaqs} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">FAQ</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Common questions about buying, specifying, and installing
              transformers. Can&apos;t find what you&apos;re looking for?{" "}
              <Link href="#contact" className="text-primary hover:underline">
                Contact our team
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="space-y-16">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8 pb-4 border-b border-border">
                  {category.title}
                </h2>
                <div className="grid gap-6">
                  {category.faqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group bg-card border border-border rounded-xl"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                        <h3 className="font-medium text-foreground pr-4">
                          {faq.question}
                        </h3>
                        <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Our team is ready to help with your specific transformer questions.
            Whether you need help with specifications, pricing, or lead times—we&apos;re
            here to assist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/specbuilder"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:border-primary/50 transition-colors"
            >
              AI Spec Builder
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}
