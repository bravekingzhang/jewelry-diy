interface ShopifyAdminRequestBody {
  query: string;
  variables?: Record<string, unknown>;
}

interface ShopifyAdminResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const SHOPIFY_API_VERSION = "2026-04";

function getAdminConfig() {
  const domain = process.env.SHOPIFY_DOMAIN ?? "";
  const token = process.env.SHOPIFY_ADMIN_TOKEN ?? "";

  if (!domain || !token) {
    throw new Error("Missing Shopify domain or admin token");
  }

  return {
    endpoint: `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    token,
  };
}

export async function shopifyAdminFetch<T>(
  body: ShopifyAdminRequestBody,
): Promise<T> {
  const { endpoint, token } = getAdminConfig();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ShopifyAdminResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }

  if (!payload.data) {
    throw new Error("Shopify Admin response missing data");
  }

  return payload.data;
}
