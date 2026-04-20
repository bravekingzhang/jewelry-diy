import { NextResponse } from "next/server";
import { createShopifyCart } from "@/lib/shopify/mutations/cartCreate";
import type { CartAttribute, CartLineInput } from "@/lib/shopify/types";

interface CreateCartBody {
  lines?: CartLineInput[];
  attributes?: CartAttribute[];
}

function pickLocale(request: Request): "en" | "zh" {
  const header = request.headers.get("accept-language") ?? "";
  return header.toLowerCase().includes("zh") ? "zh" : "en";
}

const MESSAGES = {
  en: {
    empty: "Cart is empty. Cannot check out.",
    failed: "Failed to create Shopify cart",
  },
  zh: {
    empty: "购物车为空，无法结账",
    failed: "创建 Shopify 购物车失败",
  },
} as const;

export async function POST(request: Request) {
  const msg = MESSAGES[pickLocale(request)];
  try {
    const body = (await request.json()) as CreateCartBody;

    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json({ error: msg.empty }, { status: 400 });
    }

    const checkoutUrl = await createShopifyCart(
      body.lines,
      body.attributes ?? [],
    );

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : msg.failed;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
