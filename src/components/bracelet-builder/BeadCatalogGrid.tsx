"use client";

import { useTranslations } from "next-intl";
import { BeadIcon } from "@/components/bracelet-builder/BeadIcon";
import type { BeadCategory, BeadOption } from "@/lib/shopify/types";

interface BeadCatalogGridProps {
  categories: Array<"全部" | BeadCategory>;
  selectedCategory: "全部" | BeadCategory;
  onSelectCategory: (category: "全部" | BeadCategory) => void;
  searchKeyword: string;
  onSearchKeywordChange: (value: string) => void;
  options: BeadOption[];
  onSelectOption: (option: BeadOption) => void;
  disabled: boolean;
}

export function BeadCatalogGrid({
  categories,
  selectedCategory,
  onSelectCategory,
  searchKeyword,
  onSearchKeywordChange,
  options,
  onSelectOption,
  disabled,
}: BeadCatalogGridProps) {
  const t = useTranslations();
  const tCategory = useTranslations("category");

  return (
    <section className="flex h-full min-h-[240px] gap-2 rounded-[20px] border border-[#E3E5EA] bg-[#F2F3F6] p-2">
      <aside className="w-[84px] shrink-0 overflow-y-auto rounded-[14px] border border-[#DEE2E9] bg-white py-1">
        {categories.map((category) => {
          const active = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`mb-1 flex w-full items-center justify-start border-l-2 px-2.5 py-2 text-left text-[13px] font-semibold transition last:mb-0 ${
                active
                  ? "border-l-[#D3272F] bg-[#FFF3F4] text-[#BB242A]"
                  : "border-l-transparent text-[#6A7280] hover:bg-[#F7F8FA]"
              }`}
            >
              {tCategory(category)}
            </button>
          );
        })}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 rounded-full border border-[#D9DCE3] bg-white px-3 py-2">
          <input
            value={searchKeyword}
            onChange={(event) => onSearchKeywordChange(event.target.value)}
            placeholder={t("catalog.searchPlaceholder")}
            className="w-full bg-transparent text-[13px] text-[#4A5260] outline-none placeholder:text-[#A0A7B4]"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          {options.length === 0 ? (
            <div className="rounded-xl bg-white px-3 py-6 text-center text-[12px] text-[#8D94A0]">
              {t("catalog.noMatches")}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {options.map((option) => {
                const unavailable = disabled || !option.availableForSale;

                return (
                  <button
                    key={option.optionId}
                    type="button"
                    disabled={unavailable}
                    onClick={() => onSelectOption(option)}
                    className="rounded-[12px] border border-[#DFE2E9] bg-white px-1.5 py-2 text-left shadow-[0_2px_6px_rgba(26,33,51,0.06)] transition enabled:active:animate-bead-pulse enabled:hover:-translate-y-[1px] enabled:hover:shadow-[0_8px_16px_rgba(26,33,51,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="mb-1 flex justify-center">
                      <BeadIcon bead={option} size={36} />
                    </div>
                    <p className="line-clamp-1 text-[11px] font-semibold text-[#2F3540]">
                      {option.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6F7682]">
                      {option.sizeMm} · ¥{option.price}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
