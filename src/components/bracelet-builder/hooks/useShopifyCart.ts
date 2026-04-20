"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CartAttribute, CartLineInput } from "@/lib/shopify/types";

interface CheckoutPayload {
  lines: CartLineInput[];
  attributes: CartAttribute[];
}

export function useShopifyCart() {
  const t = useTranslations("cart");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCartAndGoCheckout(payload: CheckoutPayload): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shopify/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? t("failed"));
      }

      window.location.href = data.checkoutUrl;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : t("failed");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { createCartAndGoCheckout, isLoading, error };
}
