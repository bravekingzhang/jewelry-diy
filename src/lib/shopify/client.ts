interface ShopifyRequestBody {
  query: string;
  variables?: Record<string, unknown>;
}

interface ShopifyResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const SHOPIFY_API_VERSION = "2026-04";

function getShopifyConfig() {
  const domain = process.env.SHOPIFY_DOMAIN ?? "";
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";

  if (!domain || !token) {
    throw new Error("Missing Shopify domain or storefront token");
  }

  return {
    endpoint: `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    token,
  };
}

export async function shopifyStorefrontFetch<T>(
  body: ShopifyRequestBody,
): Promise<T> {
  const { endpoint, token } = getShopifyConfig();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ShopifyResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }

  if (!payload.data) {
    throw new Error("Shopify response missing data");
  }

  return payload.data;
}
