import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildInstallUrl, isAllowedShop } from "@/lib/shopify/oauth";

export const STATE_COOKIE = "shopify_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") ?? process.env.SHOPIFY_DOMAIN ?? "";

  if (!isAllowedShop(shop)) {
    return NextResponse.json(
      { error: "Shop is not allowed. Set SHOPIFY_DOMAIN and retry." },
      { status: 400 },
    );
  }

  const clientId = process.env.SHOPIFY_APP_CLIENT_ID;
  const scopes = process.env.SHOPIFY_APP_SCOPES;
  if (!clientId || !scopes) {
    return NextResponse.json(
      { error: "Missing SHOPIFY_APP_CLIENT_ID or SHOPIFY_APP_SCOPES." },
      { status: 500 },
    );
  }

  const origin =
    request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host")}`
      : url.origin;
  const redirectUri = `${origin}/api/shopify/callback`;

  const state = randomBytes(32).toString("hex");

  const installUrl = buildInstallUrl({
    shop,
    clientId,
    scopes,
    redirectUri,
    state,
  });

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 5 * 60,
    path: "/api/shopify",
  });

  return NextResponse.redirect(installUrl, { status: 302 });
}
