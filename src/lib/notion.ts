import { getNotionClient } from "@/integrations/notion/client";
import type {
  ProposalProject,
  ProposalQuote,
  ProposalStats,
} from "@/types/notion";

/**
 * Read DB IDs lazily at call time so Vercel runtime env vars are available.
 */
function getProjectsDbId(): string {
  const id = process.env.NOTION_PROJECTS_DB_ID;
  if (!id) throw new Error("NOTION_PROJECTS_DB_ID is not set");
  return id;
}

function getQuotesDbId(): string {
  const id = process.env.NOTION_QUOTES_DB_ID;
  if (!id) throw new Error("NOTION_QUOTES_DB_ID is not set");
  return id;
}

/* ------------------------------------------------------------------ */
/*  Helpers to extract typed values from Notion property objects        */
/* ------------------------------------------------------------------ */

function getText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title") {
    return (prop.title || []).map((t: any) => t.plain_text).join("");
  }
  if (prop.type === "rich_text") {
    return (prop.rich_text || []).map((t: any) => t.plain_text).join("");
  }
  if (prop.type === "formula" && prop.formula?.type === "string") {
    return prop.formula.string || "";
  }
  return "";
}

function getNumber(prop: any): number | null {
  if (!prop || prop.type !== "number") return null;
  return prop.number;
}

function getDate(prop: any): string | null {
  if (!prop || prop.type !== "date" || !prop.date) return null;
  return prop.date.start || null;
}

function getStatus(prop: any): string {
  if (!prop || prop.type !== "status" || !prop.status) return "";
  return prop.status.name || "";
}

function getSelect(prop: any): string {
  if (!prop || prop.type !== "select" || !prop.select) return "";
  return prop.select.name || "";
}

function getMultiSelect(prop: any): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return (prop.multi_select || []).map((ms: any) => ms.name);
}

function getCheckbox(prop: any): boolean {
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox || false;
}

function getRollupText(prop: any): string {
  if (!prop || prop.type !== "rollup") return "";
  const arr = prop.rollup?.array || [];
  for (const item of arr) {
    if (item.type === "title") {
      return (item.title || []).map((t: any) => t.plain_text).join("");
    }
  }
  return "";
}

function getRelationIds(prop: any): string[] {
  if (!prop || prop.type !== "relation") return [];
  return (prop.relation || []).map((r: any) => r.id);
}

/* ------------------------------------------------------------------ */
/*  getProjectBySlug                                                    */
/* ------------------------------------------------------------------ */

export async function getProjectBySlug(
  slug: string
): Promise<ProposalProject | null> {
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: getProjectsDbId(),
    filter: {
      property: "Proposal Slug",
      rich_text: { equals: slug },
    },
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0] as any;
  const p = page.properties;

  // Resolve Customer Name from relation
  let customerName = "";
  const customerRelation = getRelationIds(p["Customer Name"]);
  if (customerRelation.length > 0) {
    try {
      const customerPage = await getNotionClient().pages.retrieve({
        page_id: customerRelation[0],
      }) as any;
      // Get the title property (the Customer name)
      for (const prop of Object.values(customerPage.properties) as any[]) {
        if (prop.type === "title") {
          customerName = (prop.title || [])
            .map((t: any) => t.plain_text)
            .join("");
          break;
        }
      }
    } catch {
      // Fall back to empty string if relation can't be resolved
    }
  }

  return {
    id: page.id,
    slug,
    customerName,
    productDescription: getText(p["Product Description"]),
    mvaSize: getNumber(p["MVA Size"]),
    deliveryDate: getDate(p["Delivery Date"]),
    location: getText(p["Location"]),
    zipCode: getText(p["Zip Code"]),
  };
}

/* ------------------------------------------------------------------ */
/*  getQuotesForProject                                                 */
/* ------------------------------------------------------------------ */

export async function getQuotesForProject(
  projectId: string
): Promise<ProposalQuote[]> {
  const notion = getNotionClient();
  const allPages: any[] = [];
  let cursor: string | undefined = undefined;

  // Paginate through all quotes in the database
  do {
    const response: any = await notion.databases.query({
      database_id: getQuotesDbId(),
      filter: {
        property: "Project",
        relation: { contains: projectId },
      },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    allPages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return allPages.map((page: any) => {
    const p = page.properties;

    const quotedPrice = getNumber(p["Quoted Price"]);
    const ddp = getNumber(p["DDP"]);
    const priceEquivalent = getNumber(p["Price Equivalent"]);

    const prodLT = getNumber(p["Prod LT (wks)"]);
    const shipLT = getNumber(p["Shipping LT (wks)"]);
    const adLT = getNumber(p["AD LT (wks)"]);

    // Total price: use Price Equivalent if available, otherwise sum
    const totalPrice =
      priceEquivalent ??
      (quotedPrice != null
        ? quotedPrice + (ddp ?? 0)
        : null);

    // Total weeks: sum of available lead time fields
    const totalWeeks =
      prodLT != null
        ? prodLT + (shipLT ?? 0) + (adLT ?? 0)
        : null;

    return {
      name: getRollupText(p["Supplier Profile"]),
      shortName: getText(p["Quote Name/No."]),
      country: getMultiSelect(p["Country of Origin"]).join(", "),
      quotedPrice,
      ddp,
      totalPrice,
      prodLT,
      shipLT,
      adLT,
      totalWeeks,
      status: getStatus(p["Status"]),
      bidSource: getSelect(p["Bid Source"]) || "FluxCo",
      recommended: getCheckbox(p["Recommended"]),
      description: getText(p["Description"]),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  computeStats                                                        */
/* ------------------------------------------------------------------ */

export function computeStats(quotes: ProposalQuote[]): ProposalStats {
  const countries = new Set<string>();
  let quotesReceived = 0;
  let inProcess = 0;
  let declined = 0;

  for (const q of quotes) {
    if (q.country) {
      for (const c of q.country.split(", ")) {
        if (c.trim()) countries.add(c.trim());
      }
    }

    switch (q.status) {
      case "Quote Received":
        quotesReceived++;
        break;
      case "Preparing Proposal":
        inProcess++;
        break;
      case "Declined / NA":
        declined++;
        break;
      default:
        // "Contacted via email/form", "In progress", etc. count as declined/no-bid
        declined++;
        break;
    }
  }

  return {
    totalContacted: quotes.length,
    countries: countries.size,
    quotesReceived,
    inProcess,
    declined,
  };
}
