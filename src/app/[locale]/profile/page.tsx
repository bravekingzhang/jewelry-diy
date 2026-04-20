"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const quickActions = [
  { key: "orders", value: "12", icon: "◫", href: "/profile" },
  { key: "designs", value: "8", icon: "⬡", href: "/builder" },
  { key: "favorites", value: "24", icon: "◎", href: "/products" },
] as const;

type SettingKey = "address" | "payment" | "notification" | "support";
const settingItems: SettingKey[] = ["address", "payment", "notification", "support"];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 top-5 z-[100] flex justify-center px-4">
      <div
        className="animate-[fadeSlideIn_0.25s_ease] rounded-xl border border-[#CDE7EA] bg-[#ECF8F9] px-4 py-2.5 text-[13px] text-[#1A6A73] shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
        onClick={onClose}
        role="alert"
      >
        {message}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const [toast, setToast] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [userName, setUserName] = useState(t("defaultName"));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  function handleSettingAction(action: SettingKey) {
    switch (action) {
      case "address":
        showToast(t("toast.addressComingSoon"));
        break;
      case "payment":
        showToast(t("toast.paymentInfo"));
        break;
      case "notification":
        setNotificationsEnabled((prev) => !prev);
        showToast(notificationsEnabled ? t("toast.notificationsOff") : t("toast.notificationsOn"));
        break;
      case "support":
        showToast(t("toast.supportContact"));
        break;
    }
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[470px] overflow-hidden bg-[#F1F2F5] pb-28 pt-5">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_12%_0%,#ffffff_0%,transparent_36%),radial-gradient(circle_at_100%_100%,#e9edf3_0%,transparent_30%)]" />

      <div className="relative px-4">
        <header className="mb-4 rounded-[24px] border border-[#E1E5ED] bg-white p-4 shadow-[0_14px_32px_rgba(38,45,59,0.08)]">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[#F8D7DE] via-[#EFD7DA] to-[#DDDCE7] p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[20px] text-[#8D3942]">
                ✦
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[12px] tracking-[0.18em] text-[#8C93A1]">{t("eyebrow")}</p>
              {editingName ? (
                <input
                  autoFocus
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => {
                    setEditingName(false);
                    showToast(t("nicknameUpdated"));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingName(false);
                      showToast(t("nicknameUpdated"));
                    }
                  }}
                  className="w-full border-b-2 border-[#1F6B72] bg-transparent text-[24px] leading-none tracking-[0.03em] text-[#1E2430] outline-none [font-family:var(--font-display)]"
                />
              ) : (
                <h1 className="text-[30px] leading-none tracking-[0.03em] text-[#1E2430] [font-family:var(--font-display)]">
                  {userName}
                </h1>
              )}
              <p className="mt-1 text-[13px] text-[#6E7684]">{t("subtitle")}</p>
            </div>

            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="rounded-full border border-[#DBDFE7] bg-[#F7F8FA] px-3 py-1.5 text-[13px] text-[#596170] transition active:scale-95 hover:bg-[#ECEDF0]"
            >
              {t("edit")}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: t("stats.totalOrders"), value: "¥ 8,640" },
              { label: t("stats.designsCompleted"), value: "31" },
              { label: t("stats.memberTier"), value: "Silver" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#E6EAF1] bg-[#F8F9FB] px-2 py-3 text-center">
                <p className="text-[12px] text-[#7B8391]">{item.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#202632]">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="mb-4 rounded-[22px] border border-[#E3E7EE] bg-[#F6F7FA] p-3">
          <h2 className="mb-2 px-1 text-[20px] font-semibold text-[#232935]">{t("quickAccess")}</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.key}
                href={action.href}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#E4E8EF] bg-white px-3 py-3 text-left transition active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(37,44,59,0.08)]"
              >
                <div className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F3F8] text-[18px] text-[#5E6574]">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[#242A36]">{t(`quickActions.${action.key}.title`)}</p>
                  <p className="text-[12px] text-[#808896]">{t(`quickActions.${action.key}.subtitle`)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-semibold text-[#1F2633]">{action.value}</p>
                  <p className="text-[12px] text-[#8A92A0]">{t("viewArrow")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] border border-[#E3E7EE] bg-[#F6F7FA] p-3">
          <h2 className="mb-2 px-1 text-[20px] font-semibold text-[#232935]">{t("accountSettings")}</h2>
          <div className="space-y-2">
            <div className="flex w-full items-center justify-between rounded-[16px] border border-[#E4E8EF] bg-white px-3 py-3">
              <div>
                <p className="text-[16px] font-semibold text-[#242A36]">{t("settings.language.label")}</p>
                <p className="text-[12px] text-[#808896]">{t("settings.language.desc")}</p>
              </div>
              <LanguageSwitcher />
            </div>

            {settingItems.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSettingAction(key)}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#E4E8EF] bg-white px-3 py-3 text-left transition active:scale-[0.98] hover:bg-[#FCFCFD]"
              >
                <div>
                  <p className="text-[16px] font-semibold text-[#242A36]">{t(`settings.${key}.label`)}</p>
                  <p className="text-[12px] text-[#808896]">
                    {key === "notification"
                      ? `${t(`settings.${key}.desc`)} · ${notificationsEnabled ? t("settings.notification.on") : t("settings.notification.off")}`
                      : t(`settings.${key}.desc`)}
                  </p>
                </div>
                {key === "notification" ? (
                  <div
                    className={`h-6 w-10 rounded-full p-0.5 transition ${
                      notificationsEnabled ? "bg-[#1F6B72]" : "bg-[#D1D5DB]"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        notificationsEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                ) : (
                  <span className="text-[18px] text-[#8F97A5]">→</span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      <BottomTabBar />
    </main>
  );
}
