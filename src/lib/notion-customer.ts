import { getNotionClient } from "@/integrations/notion/client";
import type { CustomerProject } from "@/types/notion";

/**
 * Read DB IDs lazily at call time so Vercel runtime env vars are available.
 */
function getProjectsDbId(): string {
  const id = process.env.NOTION_PROJECTS_DB_ID;
  if (!id) throw new Error("NOTION_PROJECTS_DB_ID is not set");
  return id;
}

/* ------------------------------------------------------------------ */
/*  Helpers (mirrored from notion.ts)                                   */
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

function getRelationIds(prop: any): string[] {
  if (!prop || prop.type !== "relation") return [];
  return (prop.relation || []).map((r: any) => r.id);
}

/* ------------------------------------------------------------------ */
/*  getProjectsByCustomerId                                             */
/* ------------------------------------------------------------------ */

export async function getProjectsByCustomerId(
  notionCustomerId: string
): Promise<CustomerProject[]> {
  const notion = getNotionClient();
  const allPages: any[] = [];
  let cursor: string | undefined = undefined;

  // Paginate through all projects linked to this customer
  do {
    const response: any = await notion.databases.query({
      database_id: getProjectsDbId(),
      filter: {
        property: "Customer Name",
        relation: { contains: notionCustomerId },
      },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    allPages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  // Resolve customer name from relation (use the first project to get it)
  let customerName = "";
  if (allPages.length > 0) {
    const firstPage = allPages[0] as any;
    const customerRelation = getRelationIds(firstPage.properties["Customer Name"]);
    if (customerRelation.length > 0) {
      try {
        const customerPage = await notion.pages.retrieve({
          page_id: customerRelation[0],
        }) as any;
        for (const prop of Object.values(customerPage.properties) as any[]) {
          if (prop.type === "title") {
            customerName = (prop.title || [])
              .map((t: any) => t.plain_text)
              .join("");
            break;
          }
        }
      } catch {
        // Fall back to empty string
      }
    }
  }

  return allPages.map((page: any) => {
    const p = page.properties;
    const slug = getText(p["Proposal Slug"]);

    return {
      id: page.id,
      slug,
      customerName,
      productDescription: getText(p["Product Description"]),
      mvaSize: getNumber(p["MVA Size"]),
      deliveryDate: getDate(p["Delivery Date"]),
      deliveryRequirement: getDate(p["Delivery Requirement"]),
      location: getText(p["Location"]),
      zipCode: getText(p["Zip Code"]),
      status: getStatus(p["Status"]),
    };
  });
}
