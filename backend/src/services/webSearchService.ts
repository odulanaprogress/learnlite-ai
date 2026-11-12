/**
 * Web Knowledge Search Service
 * Retrieves real-time academic definitions, mechanisms, and explanations
 * from trusted knowledge sources (Wikipedia & DuckDuckGo API) when a student's
 * question extends beyond their uploaded lecture materials.
 */

export interface WebSearchResult {
  title: string;
  extract: string;
  source: string;
  url?: string;
}

export async function searchWebKnowledge(query: string): Promise<WebSearchResult | null> {
  const cleanQuery = query
    .replace(/[?.,!;:'"()]/g, "")
    .replace(/^(what is|who is|explain|define|tell me about|how does|why is|describe)\s+/i, "")
    .trim();

  if (!cleanQuery || cleanQuery.length < 2) return null;

  // 1. Wikipedia Summary REST API (Fast, authoritative, free, no rate limits)
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(wikiUrl, {
      headers: { "User-Agent": "LearnLiteAI/1.0 (academic study assistant)" },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.extract && data.extract.length > 30 && data.type !== "disambiguation") {
        return {
          title: data.title || cleanQuery,
          extract: data.extract,
          source: "Wikipedia Academic Reference",
          url: data.content_urls?.desktop?.page,
        };
      }
    }
  } catch (err: any) {
    // Silently continue to fallback search
  }

  // 2. DuckDuckGo Instant Answer API (Broad fallback)
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(ddgUrl, {
      headers: { "User-Agent": "LearnLiteAI/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.AbstractText && data.AbstractText.length > 30) {
        return {
          title: data.Heading || cleanQuery,
          extract: data.AbstractText,
          source: "DuckDuckGo Knowledge Reference",
          url: data.AbstractURL,
        };
      }
    }
  } catch (err: any) {
    // Continue
  }

  return null;
}

