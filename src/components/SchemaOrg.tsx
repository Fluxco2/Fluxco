export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FluxCo",
    url: "https://fluxco.com",
    logo: "https://fluxco.com/logo.png",
    description:
      "Your complete transformer partner. Full engineering, procurement & construction services through a single trusted source.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "sales@fluxco.com",
    },
    sameAs: [
      "https://www.linkedin.com/company/fluxco",
    ],
    areaServed: "US",
    serviceType: [
      "Transformer Sales",
      "Transformer Procurement",
      "Engineering Services",
      "Project Management",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FluxCo",
    url: "https://fluxco.com",
    description:
      "In-stock padmount and substation transformers with full procurement services.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://fluxco.com/inventory?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  category: string;
  url: string;
  image?: string;
}

export function ProductSchema({
  name,
  description,
  category,
  url,
  image,
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    category,
    url,
    image: image || "https://fluxco.com/transformer-placeholder.png",
    brand: {
      "@type": "Brand",
      name: "FluxCo",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "FluxCo",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
