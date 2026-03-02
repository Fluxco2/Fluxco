import { Client } from "@notionhq/client";

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.warn("NOTION_API_KEY not set — Notion integration will not work.");
}

export const notion = NOTION_API_KEY
  ? new Client({ auth: NOTION_API_KEY })
  : (null as unknown as Client);
