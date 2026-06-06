"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { addTransaction, deleteTransaction, updateTransaction } from "@/lib/householdStore";
import { todayString, yen } from "@/lib/utils";
import DateNavigator from "@/components/household/DateNavigator";
import type { ConfirmFn } from "@/components/household/ConfirmDialog";
import type { HouseholdTransaction, TransactionType } from "@/types/household";
import type { TemplateDraft } from "@/components/household/types";

const TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v1";
const TEMPLATE_GLOBAL_ENABLED_KEY =
  "household.recurringTemplates.globalEnabled.v1";
const QUICK_SUBCATEGORY_STORAGE_KEY = "household.quickSubcategories.v1";
const ACTIVE_USER_KEY = "household.auth.userKey";

const frequentSubcategories: Record<TransactionType, string[]> = {
  expense: [
    "スーパー",
    "コンビニ",
    "外食",
    "カフェ",
    "交通費",
    "日用品",
    "携帯料金",
    "サブスク",
  ],
  income: ["給与", "副収入", "立替返金", "取崩し"],
};

function getActiveUserScope() {
  if (typeof window === "undefined") return "personal";
  return window.localStorage.getItem(ACTIVE_USER_KEY) || "personal";
}

function scopedStorageKey(key: string) {
  return `${key}.${getActiveUserScope()}`;
}

function formatNumber(value: number | string) {
  const digits = String(value).replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ja-JP");
}

function toDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function readQuickSubcategories(): Record<TransactionType, string[]> {
  if (typeof window === "undefined") return frequentSubcategories;
  try {
    const raw = window.localStorage.getItem(scopedStorageKey(QUICK_SUBCATEGORY_STORAGE_KEY));
    if (!raw) return frequentSubcategories;
    const parsed = JSON.parse(raw) as Partial<Record<TransactionType, string[]>>;
    return {
      expense: Array.isArray(parsed.expense) ? parsed.expense : frequentSubcategories.expense,
      income: Array.isArray(parsed.income) ? parsed.income : frequentSubcategories.income,
    };
  } catch {
    return frequentSubcategories;
  }
}

function writeQuickSubcategories(items: Record<TransactionType, string[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(QUICK_SUBCATEGORY_STORAGE_KEY), JSON.stringify(items));
}

export default function InputTab({
  transactions,
  templates,
  templatesEnabled,
  setTemplates,
  setTemplatesEnabled,
  onChanged,
  setMessage,
  requestConfirm,
}: {
  transactions: HouseholdTransaction[];
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: React.Dispatch<React.SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onChanged: () => Promise<void>;
  setMessage: (value: string) => void;
  requestConfirm: ConfirmFn;
}) {
  const [selectedDate, setSelectedDate] = useState(todayString());

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
      <div className="space-y-4">
        <InputPanel
          date={selectedDate}
          setDate={setSelectedDate}
          onAdded={onChanged}
          setMessage={setMessage}
        />
        <HistoryTable
          transactions={transactions}
          onChanged={onChanged}
          setMessage={setMessage}
        />
      </div>
      <FixedTemplatePanel
        date={selectedDate}
        templates={templates}
        templatesEnabled={templatesEnabled}
        setTemplates={setTemplates}
        setTemplatesEnabled={setTemplatesEnabled}
        onAdded={onChanged}
        setMessage={setMessage}
        requestConfirm={requestConfirm}
      />
    </div>
  );
}

