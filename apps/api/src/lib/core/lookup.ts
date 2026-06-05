import { verifyToken } from "./auth.ts";
import { BATCH_GET_CHUNK_SIZE, chunkArray } from "./batch.ts";

export type LookupServiceType = "counter" | "like" | "bbs" | "ranking" | "yokoso";
export const MAX_LOOKUP_BATCH_SIZE = 1000;

export type LookupResult = {
  url: string;
  exists: boolean;
  id?: string;
  title?: string;
  authorized?: boolean;
};

type LookupRow = {
  url: string;
  public_id: string;
  service_id: string;
  metadata?: string | null;
};

type TokenRow = {
  service_id: string;
  token_hash: string;
};

function defaultTitle(type: LookupServiceType): string | undefined {
  return type === "yokoso" ? "Yokoso" : undefined;
}

function extractTitle(
  type: LookupServiceType,
  metadata: string | null | undefined
): string | undefined {
  if (!metadata) return undefined;
  try {
    const parsed = JSON.parse(metadata) as { title?: unknown };
    return typeof parsed.title === "string" ? parsed.title : defaultTitle(type);
  } catch {
    return defaultTitle(type);
  }
}

export async function batchLookupServices(
  db: D1Database,
  type: LookupServiceType,
  urls: readonly string[],
  token: string
): Promise<LookupResult[]> {
  // Public batchLookup accepts up to MAX_LOOKUP_BATCH_SIZE URLs. The chunks below
  // are only for D1/SQLite bind limits inside each SQL statement.
  const uniqueUrls = [...new Set(urls)];
  const rowsByUrl = new Map<string, LookupRow>();

  for (const urlChunk of chunkArray(uniqueUrls, BATCH_GET_CHUNK_SIZE)) {
    if (urlChunk.length === 0) continue;
    const placeholders = urlChunk.map(() => "?").join(",");
    const { results } = await db
      .prepare(
        `
        SELECT m.url, m.service_id AS public_id, s.id AS service_id, s.metadata
        FROM url_mappings m
        JOIN services s ON s.id = ? || ':' || m.service_id
        WHERE m.type = ? AND m.url IN (${placeholders})
      `
      )
      .bind(type, type, ...urlChunk)
      .all<LookupRow>();

    for (const row of results) {
      rowsByUrl.set(row.url, row);
    }
  }

  const serviceIds = [...new Set([...rowsByUrl.values()].map((row) => row.service_id))];
  const authorizedByServiceId = new Map<string, boolean>();

  for (const idChunk of chunkArray(serviceIds, BATCH_GET_CHUNK_SIZE)) {
    if (idChunk.length === 0) continue;
    const placeholders = idChunk.map(() => "?").join(",");
    const { results } = await db
      .prepare(
        `
        SELECT service_id, token_hash
        FROM owner_tokens
        WHERE service_id IN (${placeholders})
      `
      )
      .bind(...idChunk)
      .all<TokenRow>();

    for (const row of results) {
      authorizedByServiceId.set(row.service_id, await verifyToken(token, row.token_hash));
    }
  }

  return urls.map((url) => {
    const row = rowsByUrl.get(url);
    if (!row) {
      return { url, exists: false };
    }

    const authorized = authorizedByServiceId.get(row.service_id) === true;
    return {
      url,
      exists: true,
      authorized,
      id: authorized ? row.public_id : undefined,
      title: authorized ? extractTitle(type, row.metadata) : undefined,
    };
  });
}

export async function lookupService(
  db: D1Database,
  type: LookupServiceType,
  url: string,
  token: string
): Promise<LookupResult> {
  const [result] = await batchLookupServices(db, type, [url], token);
  return result;
}
