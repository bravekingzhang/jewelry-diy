import { mockBeads } from "@/lib/mock/beads";
import type { Bead } from "@/lib/shopify/types";

interface AdminBeadMock {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "DRAFT";
  imageUrl: string;
  colorHex: string;
  category: string;
  textureUrl: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    inventoryQuantity: number;
  }>;
}

function beadToAdmin(bead: Bead): AdminBeadMock {
  return {
    id: bead.id,
    title: bead.name,
    handle: bead.handle,
    status: "ACTIVE",
    imageUrl: bead.imageUrl,
    colorHex: bead.colorHex,
    category: bead.category,
    textureUrl: bead.textureUrl ?? "",
    variants: bead.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: String(v.price),
      inventoryQuantity: 99,
    })),
  };
}

// In-memory store for dev mode — persists across requests within the same server process
let mockStore: AdminBeadMock[] | null = null;
let nextMockId = 1000;

function getStore(): AdminBeadMock[] {
  if (!mockStore) {
    mockStore = mockBeads.map(beadToAdmin);
  }
  return mockStore;
}

export function mockAdminGetBeads(): AdminBeadMock[] {
  return getStore();
}

export function mockAdminGetBeadById(id: string): AdminBeadMock | null {
  return getStore().find((b) => b.id === id) ?? null;
}

export function mockAdminCreateBead(input: {
  title: string;
  category: string;
  colorHex: string;
  textureUrl?: string;
  variants: Array<{ title: string; price: string }>;
}): AdminBeadMock {
  const id = `mock-admin-${nextMockId++}`;
  const bead: AdminBeadMock = {
    id,
    title: input.title,
    handle: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    status: "ACTIVE",
    imageUrl: "",
    colorHex: input.colorHex,
    category: input.category,
    textureUrl: input.textureUrl ?? "",
    variants: input.variants.map((v, i) => ({
      id: `${id}-variant-${i}`,
      title: v.title,
      price: v.price,
      inventoryQuantity: 99,
    })),
  };
  getStore().push(bead);
  return bead;
}

export function mockAdminUpdateBead(
  id: string,
  input: {
    title?: string;
    category?: string;
    colorHex?: string;
    textureUrl?: string;
    variants?: Array<{ id?: string; title: string; price: string }>;
  },
): AdminBeadMock | null {
  const store = getStore();
  const index = store.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const bead = store[index];
  if (input.title) bead.title = input.title;
  if (input.category) bead.category = input.category;
  if (input.colorHex) bead.colorHex = input.colorHex;
  if (input.textureUrl !== undefined) bead.textureUrl = input.textureUrl;
  if (input.variants) {
    bead.variants = input.variants.map((v, i) => ({
      id: v.id ?? `${bead.id}-variant-${i}`,
      title: v.title,
      price: v.price,
      inventoryQuantity: 99,
    }));
  }

  store[index] = bead;
  return bead;
}

export function mockAdminDeleteBead(id: string): boolean {
  const store = getStore();
  const index = store.findIndex((b) => b.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

const PLACEHOLDER_VALUES = new Set([
  "",
  "shpat_xxx",
  "your-store.myshopify.com",
  "your-storefront-token",
  "your-webhook-secret",
  "your-revalidate-secret",
]);

export function isShopifyAdminConfigured(): boolean {
  const domain = process.env.SHOPIFY_DOMAIN ?? "";
  const token = process.env.SHOPIFY_ADMIN_TOKEN ?? "";

  if (!domain || !token) return false;
  if (PLACEHOLDER_VALUES.has(domain) || PLACEHOLDER_VALUES.has(token)) return false;

  return true;
}
