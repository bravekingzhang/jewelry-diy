import { mockBeads } from "@/lib/mock/beads";
import { getBeadsFromShopify } from "@/lib/shopify/queries/beads";
import type { Bead } from "@/lib/shopify/types";

function isShopifyConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN,
  );
}

export async function loadBeads(): Promise<Bead[]> {
  if (!isShopifyConfigured()) {
    return mockBeads;
  }

  try {
    return await getBeadsFromShopify();
  } catch (error) {
    console.error("[load-beads] Shopify fetch failed:", error);
    return [];
  }
}
