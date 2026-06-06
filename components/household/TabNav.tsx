import { CalendarDays, Home, Plus, UserRound, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppTab } from "./types";

const tabs: Array<{ key: AppTab; label: string; icon: LucideIcon }> = [
  { key: "home", label: "ホーム", icon: Home },
  { key: "input", label: "入力", icon: Plus },
  { key: "budget", label: "予算", icon: WalletCards },
  { key: "history", label: "履歴", icon: CalendarDays },
  { key: "profile", label: "プロフィール", icon: UserRound },
];

export default function TabNav({
  activeTab,
  onChange,
}: {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 mx-auto grid max-w-md grid-cols-5 gap-1 rounded-2xl border border-[#e6dcc8] bg-white/95 p-1 shadow-lg backdrop-blur lg:bottom-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-black sm:text-xs ${
              active
                ? "bg-[#5b4630] text-white"
                : "text-[#6b7280] active:bg-[#f3eadb]"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
