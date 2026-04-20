"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { BeadCatalogGrid } from "@/components/bracelet-builder/BeadCatalogGrid";
import { BraceletCanvas } from "@/components/bracelet-builder/BraceletCanvas";
import { useBraceletState } from "@/components/bracelet-builder/hooks/useBraceletState";
import { useShopifyCart } from "@/components/bracelet-builder/hooks/useShopifyCart";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import type { Bead } from "@/lib/shopify/types";
import { formatCny, formatCnyCompact } from "@/lib/utils/price";

interface BraceletBuilderProps {
  beads: Bead[];
}

export function BraceletBuilder({ beads }: BraceletBuilderProps) {
  const router = useRouter();
  const t = useTranslations("builder");
  const tHand = useTranslations("handSize");
  const {
    handSize,
    handSizePresets,
    setHandSize,
    selectedCategory,
    setSelectedCategory,
    searchKeyword,
    setSearchKeyword,
    categories,
    filteredOptions,
    selectedBeads,
    totalPrice,
    maxBeads,
    isFull,
    addBead,
    removeBead,
    moveBeadTo,
    clearDesign,
    importByVariantSequence,
    toCartLines,
    toCartAttributes,
  } = useBraceletState(beads);

  const { createCartAndGoCheckout, isLoading, error } = useShopifyCart();
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const headerStatus = useMemo(() => {
    if (selectedBeads.length < maxBeads - 2) return t("fitPerfect");
    if (selectedBeads.length < maxBeads) return t("fitTight");
    return t("fitTooSmall");
  }, [maxBeads, selectedBeads.length, t]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("design");

    if (!encoded) return;

    const variantIds = encoded
      .split(",")
      .map((value) => decodeURIComponent(value.trim()))
      .filter(Boolean);

    importByVariantSequence(variantIds);
    setShareNotice(t("share.restored"));
  }, [importByVariantSequence, t]);

  async function handleCheckout() {
    if (selectedBeads.length === 0) return;

    await createCartAndGoCheckout({
      lines: toCartLines(),
      attributes: toCartAttributes(),
    });
  }

  async function handleSaveDesign() {
    if (selectedBeads.length === 0) {
      setShareNotice(t("share.addBeadsFirst"));
      return;
    }

    const designSequence = selectedBeads
      .map((bead) => encodeURIComponent(bead.variantId))
      .join(",");

    const url = new URL(window.location.href);
    url.searchParams.set("design", designSequence);

    window.history.replaceState(null, "", url.toString());

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        setShareNotice(t("share.linkCopied"));
        return;
      }

      setShareNotice(t("share.savedToUrl"));
    } catch {
      setShareNotice(t("share.savedToUrl"));
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[470px] flex-col overflow-hidden bg-[#EFEFF2] text-[#20242D]">
      <header className="shrink-0 border-b border-[#E1E5EC] bg-[#EFEFF2]/95 px-4 pb-2 pt-1.5 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-[#D9DCE3] bg-white px-2.5 py-1.5 text-[18px] leading-none text-[#4E5563] transition active:scale-95 hover:bg-[#F0F1F4]"
            aria-label={t("back")}
          >
            ←
          </button>
          <h1 className="text-[28px] font-semibold tracking-[0.08em] text-[#1E222B] [font-family:var(--font-display)]">
            {t("title")}
          </h1>
          <div className="w-[42px]" aria-hidden />
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col px-3 pb-0 pt-1.5">
        <div className="pointer-events-none absolute left-3 top-2 z-30 max-w-[calc(100%-24px)]">
          <div className="pointer-events-auto px-0.5 py-0.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pr-1">
              <span className="shrink-0 rounded-full bg-[#D92D33] px-3 py-1 text-[12px] font-semibold text-white">
                {t("instructions")}
              </span>
              <button
                type="button"
                onClick={() => setPanelOpen((value) => !value)}
                className="shrink-0 rounded-full border border-[#D8DCE3] bg-white px-3 py-1 text-[12px] text-[#7A818D]"
              >
                {headerStatus}
              </button>
              <span className="shrink-0 rounded-full border border-[#D8DCE3] bg-white px-3 py-1 text-[12px] font-semibold text-[#6A707E]">
                {t("totalPrice", { price: formatCny(totalPrice) })}
              </span>
            </div>

            {panelOpen ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {handSizePresets.map((preset) => {
                  const active = preset.key === handSize.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => {
                        setHandSize(preset);
                        setPanelOpen(false);
                      }}
                      className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                        active
                          ? "border-[#1F6B72] bg-[#1F6B72] text-white"
                          : "border-[#D7DBE3] bg-white text-[#656D79]"
                      }`}
                    >
                      {tHand(preset.key)}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <section className="shrink-0 rounded-[20px] border border-[#E2E5EB] bg-[#F7F8FA] p-2">
          <BraceletCanvas
            beads={selectedBeads}
            maxBeads={maxBeads}
            totalPrice={totalPrice}
            onRemove={removeBead}
            onMoveTo={moveBeadTo}
          />

          <div className="mt-1.5 text-center text-[12px] text-[#7B8291]">
            {t("hint", { count: selectedBeads.length, max: maxBeads })}
          </div>
        </section>

        <div className="mt-2 min-h-[220px] flex-1 overflow-y-auto pb-[156px]">
          <BeadCatalogGrid
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            options={filteredOptions}
            onSelectOption={addBead}
            disabled={isFull}
          />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-[76px] z-40 px-3">
        <div className="mx-auto flex w-full max-w-[470px] items-center justify-between gap-2 rounded-[20px] border border-[#DCE0E8] bg-[#F6F7FA] p-2 shadow-[0_10px_24px_rgba(44,50,64,0.12)]">
          <button
            type="button"
            onClick={clearDesign}
            className="rounded-[14px] border border-[#242A34] bg-white px-4 py-3 text-[14px] font-semibold leading-none text-[#262C37]"
            aria-label={t("clearAriaLabel")}
          >
            {t("clear")}
          </button>

          <button
            type="button"
            onClick={handleSaveDesign}
            className="rounded-[14px] bg-[#DB2D33] px-5 py-3 text-[16px] font-semibold text-white shadow-[0_6px_12px_rgba(219,45,51,0.28)]"
          >
            {t("save")}
          </button>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={selectedBeads.length === 0 || isLoading}
            className="rounded-[14px] border border-[#313744] bg-white px-4 py-3 text-[20px] leading-none text-[#212733] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("checkoutAriaLabel")}
          >
            ◧
          </button>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={selectedBeads.length === 0 || isLoading}
            className="flex-1 rounded-[14px] border border-[#343A46] bg-white px-4 py-3 text-right text-[18px] font-semibold text-[#2B313D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t("redirecting") : t("completeCheckout", { price: formatCnyCompact(totalPrice) })}
          </button>
        </div>

        {error ? (
          <div className="mx-auto mt-2 w-full max-w-[470px] rounded-xl border border-[#F1B8BB] bg-[#FDEDEE] px-3 py-2 text-[13px] text-[#AE3036]">
            {error}
          </div>
        ) : null}

        {shareNotice ? (
          <div className="mx-auto mt-2 w-full max-w-[470px] rounded-xl border border-[#CDE7EA] bg-[#ECF8F9] px-3 py-2 text-[13px] text-[#1A6A73]">
            {shareNotice}
          </div>
        ) : null}
      </div>

      <BottomTabBar />
    </div>
  );
}
