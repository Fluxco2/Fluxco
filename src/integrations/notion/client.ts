import { Client } from "@notionhq/client";

let _client: Client | null = null;

/**
 * Lazy-initialized Notion client.
 * This ensures the env var is read at runtime (not build time on Vercel).
 */
export function getNotionClient(): Client {
  if (_client) return _client;

  const key = process.env.NOTION_API_KEY;
  if (!key) {
    throw new Error("NOTION_API_KEY is not set");
  }

  _client = new Client({ auth: key });
  return _client;
}

/** @deprecated — use getNotionClient() instead */
export const notion = null as unknown as Client;
