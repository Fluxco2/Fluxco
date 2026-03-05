import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate admin password
    if (password !== "fluxco2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.NOTION_API_KEY || !process.env.NOTION_CUSTOMERS_DB_ID) {
      return NextResponse.json(
        { error: "Notion configuration missing" },
        { status: 500 }
      );
    }

    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Query all customers from the Notion Customers database
    const results: { id: string; name: string }[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response: any = await notion.databases.query({
        database_id: process.env.NOTION_CUSTOMERS_DB_ID,
        start_cursor: cursor,
        page_size: 100,
        sorts: [{ property: "Customer", direction: "ascending" }],
      });

      for (const page of response.results) {
        const titleProp = (page as any).properties?.Customer?.title;
        const name = titleProp?.map((t: any) => t.plain_text).join("") || "Untitled";
        results.push({ id: page.id, name });
      }

      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    return NextResponse.json({ customers: results });
  } catch (error: any) {
    console.error("Notion customers error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
