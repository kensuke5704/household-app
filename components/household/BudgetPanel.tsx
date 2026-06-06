"use client";

import { useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { saveBudgets } from "@/lib/householdStore";
import { yen } from "@/lib/utils";
import type { HouseholdBudget } from "@/types/household";
import type { ConfirmFn } from "@/components/household/ConfirmDialog";

type BudgetPanelProps = {
  month: string;
  budgets: HouseholdBudget[];
  onSaved: () => Promise<void>;
  setMessage: (value: string) => void;
  requestConfirm: ConfirmFn;
};

function toDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalMonth(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function getMonthLabel(month: string) {
  const [year, m] = month.split("-");
  return `${year}年${Number(m)}月`;
}

function getMonthsFromSelectedForward(selectedMonth: string, count = 120) {
  const [startYear, startMonth] = selectedMonth.split("-").map(Number);
  const cursor = new Date(startYear, startMonth - 1, 1);
  const months: string[] = [];
  for (let i = 0; i < count; i += 1) {
    months.push(formatLocalMonth(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export default function BudgetPanel({
  month,
  budgets,
  onSaved,
  setMessage,
  requestConfirm,
}: BudgetPanelProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const incomeBudgets = budgets.filter((budget) =>
    incomeCategories.includes(budget.category as any),
  );
  const expenseBudgets = budgets.filter((budget) =>
    expenseCategories.includes(budget.category as any),
  );

  useEffect(() => {
    setDrafts(
      Object.fromEntries(budgets.map((budget) => [budget.category, String(budget.budget)])),
    );
  }, [budgets]);

  function handleChangeBudget(category: string, value: string) {
    setDrafts((current) => ({ ...current, [category]: value }));
  }

  async function handleConfirmBudget() {
    const applyFollowing = await requestConfirm({
      title: "以降の月にも反映しますか？",
      message: `${getMonthLabel(month)}以降の予算にも同じ変更を反映します。`,
      confirmLabel: "以降にも反映",
      cancelLabel: "この月のみ",
    });
    const targetMonths = applyFollowing ? getMonthsFromSelectedForward(month) : [month];
    const nextBudgets = budgets.map((budget) => ({
      ...budget,
      budget: Number(toDigits(drafts[budget.category] || "0")),
    }));

    try {
      setSaving(true);
      await Promise.all(
        targetMonths.map((targetMonth) =>
          saveBudgets(
            targetMonth,
            nextBudgets.map((budget) => ({ ...budget, month: targetMonth })),
          ),
        ),
      );
      setMessage(
        applyFollowing
          ? `${getMonthLabel(month)}以降の予算を確定しました`
          : `${getMonthLabel(month)}の予算を確定しました`,
      );
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "予算保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <WalletCards size={18} className="shrink-0 text-[#8a6a3f]" />
            <h2 className="truncate text-lg font-black text-[#24190f]">月別予算</h2>
          </div>
          <button
            type="button"
            onClick={handleConfirmBudget}
            disabled={saving}
            className="shrink-0 rounded-xl bg-[#5b4630] px-3 py-2 text-xs font-black text-white shadow-sm disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            {saving ? "確定中..." : "予算を確定"}
          </button>
        </div>
        <BudgetGroup
          title="収入"
          rows={incomeBudgets}
          drafts={drafts}
          onChangeBudget={handleChangeBudget}
        />
        <BudgetGroup
          title="支出"
          rows={expenseBudgets}
          drafts={drafts}
          onChangeBudget={handleChangeBudget}
        />
      </div>
    </div>
  );
}

function BudgetGroup({
  title,
  rows,
  drafts,
  onChangeBudget,
}: {
  title: string;
  rows: HouseholdBudget[];
  drafts: Record<string, string>;
  onChangeBudget: (category: string, value: string) => void;
}) {
  const budgetOptions = Array.from({ length: 501 }, (_, index) => index * 1000);

  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 text-sm font-black text-[#5b4630]">{title}</h3>
      <div className="space-y-2">
        {rows.map((budget) => (
          <label
            key={budget.category}
            className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#f0e7d8] bg-[#fbfaf7] px-3 py-2 min-[380px]:grid-cols-[minmax(0,1fr)_118px] sm:grid-cols-[minmax(0,1fr)_140px]"
          >
            <span className="text-sm font-bold text-[#24190f]">
              {budget.category}
            </span>
            <select
              value={toDigits(drafts[budget.category] ?? "0")}
              onChange={(event) => onChangeBudget(budget.category, event.target.value)}
              className="h-10 rounded-md border border-[#d7c7aa] bg-white px-2 text-right text-sm font-bold text-[#24190f]"
            >
              {budgetOptions.map((value) => (
                <option key={value} value={String(value)}>
                  {yen(value)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
