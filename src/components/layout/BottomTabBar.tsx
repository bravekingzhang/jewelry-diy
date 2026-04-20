"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const tabs = [
  { key: "home", href: "/", icon: "⌂" },
  { key: "products", href: "/products", icon: "◌" },
  { key: "diy", href: "/builder", icon: "⬟" },
  { key: "cart", href: "/builder?panel=checkout", icon: "◧" },
  { key: "profile", href: "/profile", icon: "◔" },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#DADDE4] bg-[#F8F9FB]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-[460px] grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const basePath = tab.href.split("?")[0];
          const isActive =
            basePath === "/"
              ? pathname === "/"
              : pathname.startsWith(basePath);

          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center justify-center rounded-xl py-0.5 text-[12px] transition active:scale-95 ${
                  isActive
                    ? "text-[#A8242A]"
                    : "text-[#8D94A0] hover:text-[#6A7280]"
                }`}
              >
                <span
                  className={`mb-0.5 text-[20px] leading-none transition ${
                    isActive ? "scale-105" : "opacity-85"
                  }`}
                  aria-hidden
                >
                  {tab.icon}
                </span>
                <span className="leading-none">{t(tab.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
