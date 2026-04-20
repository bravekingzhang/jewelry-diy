"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

const inspirations = [
  { key: "bodhiCake", toneA: "#F8F8F8", toneB: "#D9A323", toneC: "#A53B26", user: "@吴烦恼" },
  { key: "greenDragon", toneA: "#2A2D2D", toneB: "#5D6268", toneC: "#D52D2F", user: "@Oo" },
  { key: "halfHeart", toneA: "#E9A44A", toneB: "#BE3D2A", toneC: "#DADDE3", user: "@=￣ω￣=" },
] as const;

function MiniBracelet({
  toneA,
  toneB,
  toneC,
}: {
  toneA: string;
  toneB: string;
  toneC: string;
}) {
  const ring = [
    toneA, toneA, toneA, toneB, toneA, toneA,
    toneC, toneA, toneA, toneB, toneA, toneA,
  ];

  return (
    <div className="relative h-24 w-24 shrink-0">
      <div className="absolute inset-0 rounded-full border border-[#E4E7ED]" />
      {ring.map((color, index) => {
        const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2;
        const x = 48 + 37 * Math.cos(angle);
        const y = 48 + 37 * Math.sin(angle);

        return (
          <span
            key={`${color}-${index}`}
            className="absolute h-3.5 w-3.5 rounded-full border border-white/60 shadow-[0_2px_6px_rgba(42,46,56,0.18)]"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");

  function handleInspirationClick(designKey: string) {
    router.push({
      pathname: "/builder",
      query: { inspiration: designKey },
    });
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[470px] overflow-hidden bg-[#F1F2F5] pb-28 pt-5">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_14%_0%,#ffffff_0%,transparent_35%),radial-gradient(circle_at_100%_100%,#ebeef4_0%,transparent_28%)]" />

      <div className="relative px-4">
        <header className="mb-5">
          <p className="mb-2 text-[11px] tracking-[0.28em] text-[#8A91A0]">{t("eyebrow")}</p>
          <h1 className="text-[38px] leading-none tracking-[0.04em] text-[#1A202C] [font-family:var(--font-display)]">
            {t("title")}
          </h1>
          <p className="mt-2 text-[14px] text-[#6F7785]">{t("tagline")}</p>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <Link
            href="/builder"
            className="group relative overflow-hidden rounded-[22px] border border-[#E2E6EE] bg-white px-4 pb-5 pt-4 shadow-[0_12px_30px_rgba(37,44,59,0.08)] transition hover:-translate-y-0.5"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F8ECEF] to-transparent" />
            <div className="relative mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-[#F0E5E8] text-[18px] text-[#81333A]">
              ✦
            </div>
            <p className="relative text-[13px] tracking-[0.16em] text-[#7A8190]">{t("designLabel")}</p>
            <p className="relative mt-1 text-[34px] font-semibold leading-[0.95] tracking-[0.02em] text-[#1F2531]">
              {t("designLineA")}
              <br />
              {t("designLineB")}
            </p>
            <p className="relative mt-3 text-[13px] text-[#5A6372] opacity-0 transition group-hover:opacity-100">{t("designEnter")}</p>
          </Link>

          <Link
            href="/products"
            className="group relative overflow-hidden rounded-[22px] border border-[#E2E6EE] bg-white px-4 pb-5 pt-4 shadow-[0_12px_30px_rgba(37,44,59,0.08)] transition hover:-translate-y-0.5"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F1F1ED] to-transparent" />
            <div className="relative mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-[#ECECE7] text-[18px] text-[#5D646F]">
              ◎
            </div>
            <p className="relative text-[13px] tracking-[0.16em] text-[#7A8190]">{t("pickLabel")}</p>
            <p className="relative mt-1 text-[34px] font-semibold leading-[0.95] tracking-[0.02em] text-[#1F2531]">
              {t("pickLineA")}
              <br />
              {t("pickLineB")}
            </p>
            <p className="relative mt-3 text-[13px] text-[#5A6372] opacity-0 transition group-hover:opacity-100">{t("pickEnter")}</p>
          </Link>
        </section>

        <section className="rounded-[24px] border border-[#E3E7EE] bg-[#F6F7FA] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-[42px] leading-none tracking-[0.02em] text-[#1F2531] [font-family:var(--font-display)]">{t("plazaTitle")}</h2>
              <p className="mt-1 text-[14px] text-[#6E7684]">{t("plazaSubtitle")}</p>
            </div>
            <Link
              href="/products"
              className="rounded-full border border-[#DCE1E9] bg-white px-3 py-1 text-[13px] text-[#5F6774] transition hover:bg-[#F0F1F4]"
            >
              {t("moreLink")}
            </Link>
          </div>

          <div className="space-y-3 pb-1">
            {inspirations.map((design) => (
              <article
                key={design.key}
                className="group cursor-pointer rounded-[18px] border border-[#E7EAF0] bg-white px-4 py-4 transition active:scale-[0.98] hover:shadow-[0_12px_24px_rgba(37,44,59,0.08)]"
                onClick={() => handleInspirationClick(design.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleInspirationClick(design.key);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[34px] font-semibold leading-none tracking-[0.02em] text-[#1F2531]">
                      {t(`inspiration.${design.key}.name`)}
                    </h3>
                    <p className="mt-1 text-[14px] text-[#8B93A1]">{design.user}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] text-[#9EA5B2]">{t(`inspiration.${design.key}.desc`)}</p>
                    <p className="mt-3 inline-block border-b border-[#232936] pb-0.5 text-[15px] text-[#232936] transition group-hover:border-[#D92D33] group-hover:text-[#D92D33]">
                      {t("customizeThis")}
                    </p>
                  </div>
                  <MiniBracelet
                    toneA={design.toneA}
                    toneB={design.toneB}
                    toneC={design.toneC}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <BottomTabBar />
    </main>
  );
}
