import { setRequestLocale } from "next-intl/server";
import { BraceletBuilder } from "@/components/bracelet-builder/BraceletBuilder";
import { loadBeads } from "@/lib/load-beads";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const beads = await loadBeads();

  return <BraceletBuilder beads={beads} />;
}
