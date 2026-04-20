"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import type { Bead, BeadCategory, BeadVariant } from "@/lib/shopify/types";

interface ProductsClientProps {
  beads: Bead[];
}

function BeadDetailSheet({
  bead,
  onClose,
}: {
  bead: Bead;
  onClose: () => void;
}) {
  const t = useTranslations("products");
  const tCategory = useTranslations("category");
  const [selectedVariant, setSelectedVariant] = useState<BeadVariant>(bead.variants[0]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[470px] animate-[slideUp_0.3s_ease] rounded-t-[28px] border-t border-[#E3E5EA] bg-white px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D1D5DB]" />

        <div className="flex items-start gap-4">
          <div
            className="h-20 w-20 shrink-0 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            style={{
              background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${bead.colorHex} 52%, color-mix(in srgb, ${bead.colorHex} 72%, #7f8899) 100%)`,
            }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-[22px] font-semibold text-[#1E2430]">{bead.name}</h3>
            <p className="mt-0.5 text-[13px] text-[#7B8391]">{tCategory(bead.category)}</p>
            <p className="mt-1 text-[18px] font-semibold text-[#D92D33]">
              ¥ {selectedVariant.price}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[13px] font-medium text-[#4A5260]">{t("selectSize")}</p>
          <div className="flex flex-wrap gap-2">
            {bead.variants.map((variant) => {
              const active = variant.id === selectedVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!variant.availableForSale}
                  onClick={() => setSelectedVariant(variant)}
                  className={`rounded-full border px-4 py-2 text-[14px] font-medium transition ${
                    active
                      ? "border-[#1F6B72] bg-[#1F6B72] text-white"
                      : variant.availableForSale
                        ? "border-[#D9DCE3] bg-white text-[#4A5260] hover:border-[#1F6B72]"
                        : "border-[#E8E8E8] bg-[#F5F5F5] text-[#BBBBC0] line-through"
                  }`}
                >
                  {variant.title} · ¥{variant.price}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            href={{
              pathname: "/builder",
              query: { addVariant: selectedVariant.id },
            }}
            className="flex-1 rounded-xl bg-[#1F6B72] py-3.5 text-center text-[16px] font-semibold text-white shadow-[0_6px_12px_rgba(31,107,114,0.25)] transition active:scale-[0.98]"
          >
            {t("addToBracelet")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#D9DCE3] bg-white px-5 py-3.5 text-[14px] text-[#596170] transition active:scale-[0.98]"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductsClient({ beads }: ProductsClientProps) {
  const t = useTranslations("products");
  const tCategory = useTranslations("category");
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"全部" | BeadCategory>("全部");

  const categories: Array<"全部" | BeadCategory> = [
    "全部",
    ...(Array.from(new Set(beads.map((b) => b.category))) as BeadCategory[]),
  ];

  const filtered =
    selectedCategory === "全部"
      ? beads
      : beads.filter((b) => b.category === selectedCategory);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[470px] bg-[#EFEFF2] px-4 pb-24 pt-5">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-[30px] font-semibold tracking-[0.08em] [font-family:var(--font-display)]">
          {t("title")}
        </h1>
        <p className="rounded-full border border-[#D8DCE3] bg-[#F7F8FA] px-3 py-1 text-[13px] text-[#6A7280]">
          {t("count", { count: beads.length })}
        </p>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
              selectedCategory === cat
                ? "border-[#1F6B72] bg-[#1F6B72] text-white"
                : "border-[#D9DCE3] bg-white text-[#596170]"
            }`}
          >
            {tCategory(cat)}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-3 pb-24 sm:grid-cols-3">
        {filtered.flatMap((bead) =>
          bead.variants.map((variant) => (
            <article
              key={`${bead.id}-${variant.id}`}
              className="cursor-pointer rounded-[18px] border border-[#DFE2E9] bg-white px-3 py-3 transition active:scale-[0.97] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(37,44,59,0.1)]"
              onClick={() => setSelectedBead(bead)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedBead(bead);
                }
              }}
            >
              <div
                className="mx-auto mb-2 h-16 w-16 rounded-full border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                style={{
                  background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${bead.colorHex} 52%, color-mix(in srgb, ${bead.colorHex} 72%, #7f8899) 100%)`,
                }}
              />
              <h2 className="line-clamp-1 text-[15px] font-semibold text-[#2E3440]">
                {bead.name}
              </h2>
              <p className="text-[13px] text-[#6F7682]">
                {variant.sizeMm}mm · <span className="font-medium text-[#D92D33]">¥{variant.price}</span>
              </p>
              <p className="mt-1 text-[11px] text-[#9CA3AF]">{t("tapForDetails")}</p>
            </article>
          )),
        )}
      </section>

      {selectedBead && (
        <BeadDetailSheet
          bead={selectedBead}
          onClose={() => setSelectedBead(null)}
        />
      )}

      <BottomTabBar />
    </main>
  );
}
