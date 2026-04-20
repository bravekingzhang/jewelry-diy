import { setRequestLocale } from "next-intl/server";
import { loadBeads } from "@/lib/load-beads";
import { ProductsClient } from "@/components/products/ProductsClient";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const beads = await loadBeads();

  return <ProductsClient beads={beads} />;
}
