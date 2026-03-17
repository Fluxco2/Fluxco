import { getNotionClient } from "@/integrations/notion/client";

/* ------------------------------------------------------------------ */
/*  Notion property helpers (same as notion.ts)                        */
/* ------------------------------------------------------------------ */

function getText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title")
    return (prop.title || []).map((t: any) => t.plain_text).join("");
  if (prop.type === "rich_text")
    return (prop.rich_text || []).map((t: any) => t.plain_text).join("");
  if (prop.type === "email") return prop.email || "";
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

function getMultiSelect(prop: any): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return (prop.multi_select || []).map((ms: any) => ms.name);
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
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FreddyProjectSpec {
  id: string;
  productDescription: string;
  mvaSize: number | null;
  deliveryDate: string | null;
  deliveryRequirement: string | null;
  location: string;
  zipCode: string;
  customerName: string;
}

export interface FreddyOEM {
  id: string;
  companyName: string;
  contactName: string;
  emails: string[];
  country: string[];
  supplierType: string[];
  certifications: string[];
}

/* ------------------------------------------------------------------ */
/*  Get project spec from Notion                                       */
/* ------------------------------------------------------------------ */

export async function getFreddyProjectSpec(
  projectId: string
): Promise<FreddyProjectSpec> {
  const notion = getNotionClient();
  const page = (await notion.pages.retrieve({ page_id: projectId })) as any;
  const p = page.properties;

  // Resolve customer name from relation
  let customerName = "";
  const customerRelation = getRelationIds(p["Customer Name"]);
  if (customerRelation.length > 0) {
    try {
      const customerPage = (await notion.pages.retrieve({
        page_id: customerRelation[0],
      })) as any;
      for (const prop of Object.values(customerPage.properties) as any[]) {
        if (prop.type === "title") {
          customerName = (prop.title || [])
            .map((t: any) => t.plain_text)
            .join("");
          break;
        }
      }
    } catch {
      // Fall back to empty
    }
  }

  return {
    id: page.id,
    productDescription: getText(p["Product Description"]),
    mvaSize: getNumber(p["MVA Size"]),
    deliveryDate: getDate(p["Delivery Date"]),
    deliveryRequirement: getDate(p["Delivery Requirement"]),
    location: getText(p["Location"]),
    zipCode: getText(p["Zip Code"]),
    customerName,
  };
}

/* ------------------------------------------------------------------ */
/*  Determine OEM type based on MVA size                               */
/* ------------------------------------------------------------------ */

export function determineOEMType(mvaSize: number | null): string {
  if (mvaSize && mvaSize > 10) return "Transformers - Large";
  return "Transformers - Distribution";
}

/* ------------------------------------------------------------------ */
/*  Extract emails from OEM record (3 email fields + contact notes)    */
/* ------------------------------------------------------------------ */

function extractEmails(p: any): string[] {
  const emails = new Set<string>();
  const fields = ["Email", "Additional Email", "Email Address"];

  for (const field of fields) {
    const val = (p[field]?.email || "").trim().toLowerCase();
    if (val && val.includes("@")) {
      // Handle comma/semicolon separated emails
      for (const e of val.split(/[,;]/)) {
        const trimmed = e.trim();
        if (trimmed && trimmed.includes("@")) emails.add(trimmed);
      }
    }
  }

  // Also check Contact rich_text for embedded emails
  const contactText = getText(p["Contact"]);
  const emailRegex = /[\w.+-]+@[\w.-]+\.\w+/g;
  const matches = contactText.match(emailRegex);
  if (matches) {
    for (const m of matches) {
      emails.add(m.toLowerCase().trim());
    }
  }

  return Array.from(emails);
}

/* ------------------------------------------------------------------ */
/*  Find matching OEMs from Notion                                     */
/* ------------------------------------------------------------------ */

export async function findMatchingOEMs(
  spec: FreddyProjectSpec,
  countryFilter?: string[]
): Promise<FreddyOEM[]> {
  const notion = getNotionClient();
  const oemDbId = process.env.NOTION_OEM_DB_ID;
  if (!oemDbId) throw new Error("NOTION_OEM_DB_ID is not set");

  const oemType = determineOEMType(spec.mvaSize);

  const filterConditions: any[] = [
    {
      property: "OEM / Supplier Type",
      multi_select: { contains: oemType },
    },
  ];

  // Notion doesn't support multi_select "contains any of" natively,
  // so country filtering is done post-query
  const allPages: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response: any = await notion.databases.query({
      database_id: oemDbId,
      filter: { and: filterConditions },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    allPages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const oems: FreddyOEM[] = [];

  for (const page of allPages) {
    const p = page.properties;
    const countries = getMultiSelect(p["Country"]);

    // Apply country filter if specified
    if (
      countryFilter &&
      countryFilter.length > 0 &&
      !countries.some((c) => countryFilter.includes(c))
    ) {
      continue;
    }

    const emails = extractEmails(p);
    if (emails.length === 0) continue; // Skip OEMs with no email

    oems.push({
      id: page.id,
      companyName: getText(p["Company"]),
      contactName: getText(p["Contact"]).split("\n")[0].replace(/also:?\s*/i, "").trim(),
      emails,
      country: countries,
      supplierType: getMultiSelect(p["OEM / Supplier Type"]),
      certifications: getMultiSelect(p["Quality Certifications"]),
    });
  }

  return oems;
}

/* ------------------------------------------------------------------ */
/*  Build outreach email                                                */
/* ------------------------------------------------------------------ */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------ */
/*  Update OEM status in Notion                                        */
/* ------------------------------------------------------------------ */

type StatusField = "Status for 20MVA" | "Status for 3 MVA";

const STATUS_20MVA_OPTIONS = [
  "Sent email",
  "Sent email. Called number",
  "Distributor form",
  "Info form",
  "Preparing Proposal",
  "Responded. Coordinating",
  "Proposal Received",
  "Established Relationship",
  "Responded",
  "Declined",
] as const;

export async function updateOEMStatus(
  oemPageId: string,
  field: StatusField,
  statusName: string
): Promise<void> {
  const notion = getNotionClient();
  await notion.pages.update({
    page_id: oemPageId,
    properties: {
      [field]: { status: { name: statusName } },
    },
  });
}

export async function updateOEMNotes(
  oemPageId: string,
  notes: string
): Promise<void> {
  const notion = getNotionClient();
  // Get existing notes first
  const page = (await notion.pages.retrieve({ page_id: oemPageId })) as any;
  const existingNotes = getText(page.properties["Notes"]);
  const timestamp = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const updatedNotes = existingNotes
    ? `${existingNotes}\n[${timestamp}] ${notes}`
    : `[${timestamp}] ${notes}`;

  await notion.pages.update({
    page_id: oemPageId,
    properties: {
      Notes: { rich_text: [{ text: { content: updatedNotes.slice(0, 2000) } }] },
    },
  });
}

export async function updateOEMContact(
  oemPageId: string,
  updates: {
    contact?: string;
    email?: string;
    additionalEmail?: string;
    phone?: string;
  }
): Promise<void> {
  const notion = getNotionClient();
  const properties: Record<string, any> = {};

  if (updates.contact) {
    properties["Contact"] = {
      rich_text: [{ text: { content: updates.contact } }],
    };
  }
  if (updates.email) {
    properties["Email Address"] = { email: updates.email };
  }
  if (updates.additionalEmail) {
    properties["Additional Email"] = { email: updates.additionalEmail };
  }
  if (updates.phone) {
    properties["Phone Number"] = { phone_number: updates.phone };
  }

  if (Object.keys(properties).length > 0) {
    await notion.pages.update({ page_id: oemPageId, properties });
  }
}

/* ------------------------------------------------------------------ */
/*  Create OEM record in Notion from email data                        */
/* ------------------------------------------------------------------ */

export async function createOEMRecord(data: {
  name: string;
  supplierType?: string[];
  country?: string[];
  contact?: string;
  email?: string;
  additionalEmail?: string;
  phone?: string;
  website?: string;
  notes?: string;
}): Promise<string> {
  const notion = getNotionClient();
  const oemDbId = process.env.NOTION_OEM_DB_ID;
  if (!oemDbId) throw new Error("NOTION_OEM_DB_ID is not set");

  const properties: Record<string, any> = {
    Company: { title: [{ text: { content: data.name } }] },
  };

  if (data.supplierType?.length) {
    properties["OEM / Supplier Type"] = {
      multi_select: data.supplierType.map((name) => ({ name })),
    };
  }
  if (data.country?.length) {
    properties["Country"] = {
      multi_select: data.country.map((name) => ({ name })),
    };
  }
  if (data.contact) {
    properties["Contact"] = {
      rich_text: [{ text: { content: data.contact } }],
    };
  }
  if (data.email) {
    properties["Email Address"] = { email: data.email };
  }
  if (data.additionalEmail) {
    properties["Additional Email"] = { email: data.additionalEmail };
  }
  if (data.phone) {
    properties["Phone Number"] = { phone_number: data.phone };
  }
  if (data.website) {
    properties["Website"] = { url: data.website.startsWith("http") ? data.website : `https://${data.website}` };
  }
  if (data.notes) {
    properties["Notes"] = {
      rich_text: [{ text: { content: data.notes.slice(0, 2000) } }],
    };
  }

  const page = await notion.pages.create({
    parent: { database_id: oemDbId },
    properties,
  });

  return page.id;
}

/* ------------------------------------------------------------------ */
/*  Find OEM by email in Notion                                        */
/* ------------------------------------------------------------------ */

export async function findOEMByEmail(email: string): Promise<{ id: string; name: string } | null> {
  const notion = getNotionClient();
  const oemDbId = process.env.NOTION_OEM_DB_ID;
  if (!oemDbId) return null;

  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split("@")[1];

  // Query all OEMs and check email fields (Notion doesn't support email "contains" filter)
  const allPages: any[] = [];
  let cursor: string | undefined;
  do {
    const response: any = await notion.databases.query({
      database_id: oemDbId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    allPages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  for (const page of allPages) {
    const p = page.properties;
    const emails = extractEmails(p);
    // Check exact email match or domain match
    if (emails.some((e) => e === emailLower || e.split("@")[1] === domain)) {
      return {
        id: page.id,
        name: getText(p["Company"]),
      };
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Build outreach email                                                */
/* ------------------------------------------------------------------ */

export function buildOutreachEmail(
  spec: FreddyProjectSpec,
  oem: FreddyOEM
): { subject: string; html: string } {
  const mvaDisplay = spec.mvaSize ? `${spec.mvaSize} MVA` : "Custom";
  const greeting = oem.contactName
    ? `Hi ${escapeHtml(oem.contactName.split(" ")[0])},`
    : `Hello,`;

  const deliveryLine = spec.deliveryDate
    ? `<li><strong>Target Delivery:</strong> ${escapeHtml(spec.deliveryDate)}</li>`
    : spec.deliveryRequirement
      ? `<li><strong>Target Delivery:</strong> ${escapeHtml(spec.deliveryRequirement)}</li>`
      : `<li><strong>Target Delivery:</strong> Flexible</li>`;

  const subject = `FluxCo - Request for Quote: ${mvaDisplay} Transformer`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
  <p>${greeting}</p>

  <p>I'm reaching out from <strong>FluxCo</strong> regarding a transformer procurement project we're managing for a client. Based on ${escapeHtml(oem.companyName)}'s capabilities, we'd like to invite you to submit a quote.</p>

  <div style="background: #f8f9fa; border-left: 4px solid #2d8cff; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 15px;">Project Specifications</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>Size:</strong> ${escapeHtml(mvaDisplay)}</li>
      ${spec.productDescription ? `<li><strong>Product:</strong> ${escapeHtml(spec.productDescription)}</li>` : ""}
      <li><strong>Delivery Location:</strong> ${escapeHtml(spec.location || spec.zipCode || "USA")}</li>
      ${deliveryLine}
    </ul>
  </div>

  <p>We'd appreciate a quote including:</p>
  <ol style="padding-left: 20px;">
    <li>Unit price (FOB and/or DDP to site)</li>
    <li>Production lead time</li>
    <li>Shipping lead time to ${escapeHtml(spec.location || "the US")}</li>
    <li>Applicable certifications (UL, CSA, etc.)</li>
  </ol>

  <p>Please reply directly to this email with your quote or any questions — happy to provide additional specs.</p>

  <p style="margin-top: 24px;">
    Best regards,<br/>
    <strong>Freddy Wilson</strong><br/>
    Business Development<br/>
    <a href="https://fluxco.com" style="color: #2d8cff; text-decoration: none;">FluxCo</a> | The Transformer Marketplace
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px;" />
  <p style="color: #999; font-size: 11px;">
    You're receiving this because your company is listed in our global OEM network.
    If you'd prefer not to receive quote requests, reply with "unsubscribe."
  </p>
</div>
`;

  return { subject, html };
}
