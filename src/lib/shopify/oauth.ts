import { createHmac, timingSafeEqual } from "node:crypto";

export interface TokenExchangeResult {
  access_token: string;
  scope: string;
}

export function isAllowedShop(shop: string | null | undefined): shop is string {
  if (!shop) return false;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) return false;

  const configured = process.env.SHOPIFY_DOMAIN ?? "";
  return configured.length > 0 && shop === configured;
}

export function buildInstallUrl(args: {
  shop: string;
  clientId: string;
  scopes: string;
  redirectUri: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: args.clientId,
    scope: args.scopes,
    redirect_uri: args.redirectUri,
    state: args.state,
  });
  return `https://${args.shop}/admin/oauth/authorize?${params.toString()}`;
}

export function verifyOAuthHmac(
  searchParams: URLSearchParams,
  secret: string,
): boolean {
  const hmacHeader = searchParams.get("hmac");
  if (!hmacHeader) return false;

  const entries: [string, string][] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === "hmac" || key === "signature") continue;
    entries.push([key, value]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const message = entries
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const digest = createHmac("sha256", secret).update(message, "utf8").digest("hex");

  const digestBuffer = Buffer.from(digest, "utf8");
  const hmacBuffer = Buffer.from(hmacHeader, "utf8");

  if (digestBuffer.length !== hmacBuffer.length) return false;
  return timingSafeEqual(digestBuffer, hmacBuffer);
}

export async function exchangeCodeForToken(args: {
  shop: string;
  code: string;
  clientId: string;
  clientSecret: string;
}): Promise<TokenExchangeResult> {
  const response = await fetch(`https://${args.shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: args.clientId,
      client_secret: args.clientSecret,
      code: args.code,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Shopify token exchange failed: ${response.status} ${text}`.trim(),
    );
  }

  return (await response.json()) as TokenExchangeResult;
}

export function safeStateCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
