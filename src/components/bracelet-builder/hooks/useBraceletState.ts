"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  Bead,
  BeadCategory,
  BeadOption,
  CartAttribute,
  CartLineInput,
  SelectedBead,
} from "@/lib/shopify/types";

const HAND_SIZE_PRESETS = [
  { key: "14cm", maxBeads: 16 },
  { key: "15cm", maxBeads: 17 },
  { key: "16cm", maxBeads: 18 },
  { key: "17cm", maxBeads: 20 },
] as const;

export type HandSizePreset = (typeof HAND_SIZE_PRESETS)[number];

function toBeadOptions(beads: Bead[]): BeadOption[] {
  return beads.flatMap((bead) =>
    bead.variants.map((variant) => ({
      optionId: `${bead.id}::${variant.id}`,
      beadId: bead.id,
      variantId: variant.id,
      name: bead.name,
      category: bead.category,
      imageUrl: bead.imageUrl,
      colorHex: bead.colorHex,
      sizeMm: variant.sizeMm,
      price: variant.price,
      currencyCode: variant.currencyCode,
      availableForSale: variant.availableForSale,
    })),
  );
}

export function useBraceletState(beads: Bead[]) {
  const [selectedBeads, setSelectedBeads] = useState<SelectedBead[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"全部" | BeadCategory>("全部");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [handSize, setHandSize] = useState<HandSizePreset>(HAND_SIZE_PRESETS[2]);

  const beadOptions = useMemo(() => toBeadOptions(beads), [beads]);

  const optionByVariantId = useMemo(
    () =>
      beadOptions.reduce<Record<string, BeadOption>>((accumulator, option) => {
        accumulator[option.variantId] = option;
        return accumulator;
      }, {}),
    [beadOptions],
  );

  const categories = useMemo(() => {
    return [
      "全部",
      ...new Set(beadOptions.map((option) => option.category)),
    ] as Array<"全部" | BeadCategory>;
  }, [beadOptions]);

  const filteredOptions = useMemo(() => {
    return beadOptions.filter((option) => {
      const matchCategory =
        selectedCategory === "全部" ? true : option.category === selectedCategory;
      const loweredKeyword = searchKeyword.trim().toLowerCase();
      const matchKeyword =
        loweredKeyword.length === 0
          ? true
          : option.name.toLowerCase().includes(loweredKeyword) ||
            option.sizeMm.toString().includes(loweredKeyword);

      return matchCategory && matchKeyword;
    });
  }, [beadOptions, searchKeyword, selectedCategory]);

  const totalPrice = useMemo(
    () => selectedBeads.reduce((sum, bead) => sum + bead.price, 0),
    [selectedBeads],
  );

  const maxBeads = handSize.maxBeads;

  const isFull = selectedBeads.length >= maxBeads;

  function addBead(option: BeadOption) {
    if (isFull || !option.availableForSale) return;

    setSelectedBeads((prev) => [
      ...prev,
      {
        ...option,
        instanceId: `${option.variantId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      },
    ]);
  }

  const importByVariantSequence = useCallback(
    (variantIds: string[]) => {
      if (variantIds.length === 0) {
        setSelectedBeads([]);
        return;
      }

      const next = variantIds
        .slice(0, maxBeads)
        .map((variantId) => optionByVariantId[variantId])
        .filter((option): option is BeadOption => Boolean(option) && option.availableForSale)
        .map((option) => ({
          ...option,
          instanceId: `${option.variantId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        }));

      setSelectedBeads(next);
    },
    [maxBeads, optionByVariantId],
  );

  function removeBead(index: number) {
    setSelectedBeads((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveBeadTo(fromIndex: number, toIndex: number) {
    setSelectedBeads((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      if (fromIndex === toIndex) return prev;

      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  function clearDesign() {
    setSelectedBeads([]);
  }

  function toCartLines(): CartLineInput[] {
    return Object.values(
      selectedBeads.reduce<Record<string, CartLineInput>>((accumulator, bead) => {
        if (!accumulator[bead.variantId]) {
          accumulator[bead.variantId] = {
            merchandiseId: bead.variantId,
            quantity: 1,
          };
        } else {
          accumulator[bead.variantId].quantity += 1;
        }

        return accumulator;
      }, {}),
    );
  }

  function toCartAttributes(): CartAttribute[] {
    const beadSequence = selectedBeads
      .map((bead) => `${bead.name}-${bead.sizeMm}mm`)
      .join(",");

    return [
      { key: "bead_sequence", value: beadSequence || "" },
      { key: "bead_count", value: String(selectedBeads.length) },
      { key: "bracelet_size", value: handSize.key },
      { key: "design_total", value: totalPrice.toFixed(2) },
    ];
  }

  return {
    handSize,
    handSizePresets: HAND_SIZE_PRESETS,
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
  };
}
