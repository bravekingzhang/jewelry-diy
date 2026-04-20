"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("language");

  function switchTo(next: Locale) {
    if (next === locale) return;
    router.replace(
      // @ts-expect-error -- dynamic pathname + params is OK at runtime
      { pathname, params },
      { locale: next },
    );
  }

  return (
    <div className="flex gap-1.5">
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            className={`rounded-full border px-3 py-1 text-[12px] transition ${
              active
                ? "border-[#1F6B72] bg-[#1F6B72] text-white"
                : "border-[#D7DBE3] bg-white text-[#656D79]"
            }`}
          >
            {t(code)}
          </button>
        );
      })}
    </div>
  );
}
