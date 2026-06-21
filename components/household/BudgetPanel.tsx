"use client";

import { memo, useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { saveBudget, saveBudgetFromMonth } from "@/lib/householdStore";
import { yen } from "@/lib/utils";
import type { HouseholdBudget } from "@/types/household";
import type { ConfirmFn } from "@/components/household/ConfirmDialog";

type BudgetPanelProps = {
  month: string;
  budgets: HouseholdBudget[];
  onSaved: (budgets: HouseholdBudget[]) => void;
  setMessage: (value: string) => void;
  requestConfirm: ConfirmFn;
};

const BUDGET_OPTIONS = Array.from(
  { length: 501 },
  (_, index) => index * 1000,
);

function toDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function getMonthLabel(month: string) {
  const [year, m] = month.split("-");
  return `${year}年${Number(m)}月`;
}

export default function BudgetPanel({
  month,
  budgets,
  onSaved,
  setMessage,
  requestConfirm,
}: BudgetPanelProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

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

  async function handleChangeBudget(category: string, value: string) {
    const previousValue = drafts[category] ?? "0";
    const nextValue = Number(toDigits(value || "0"));
    if (nextValue === Number(toDigits(previousValue || "0"))) return;

    setDrafts((current) => ({ ...current, [category]: value }));
    const nextBudgets = budgets.map((budget) => ({
      ...budget,
      budget: budget.category === category ? nextValue : budget.budget,
    }));

    try {
      setSavingCategory(category);
      await saveBudget(month, category, nextValue);
      onSaved(nextBudgets);
    } catch (error) {
      setDrafts((current) => ({ ...current, [category]: previousValue }));
      setMessage(error instanceof Error ? error.message : "予算保存に失敗しました");
      setSavingCategory(null);
      return;
    }

    const applyFollowing = await requestConfirm({
      title: "この予算を以降の月にも適用しますか？",
      message: `${getMonthLabel(month)}以降の「${category}」を${yen(nextValue)}にします。`,
      confirmLabel: "OK",
      cancelLabel: "この月のみ",
    });

    if (!applyFollowing) {
      setMessage(`${getMonthLabel(month)}の予算を変更しました`);
      setSavingCategory(null);
      return;
    }

    try {
      await saveBudgetFromMonth(month, category, nextValue);
      setMessage(`${getMonthLabel(month)}以降の予算に適用しました`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "当月の予算は保存しましたが、以降の月への適用に失敗しました",
      );
    } finally {
      setSavingCategory(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <WalletCards size={18} className="shrink-0 text-[#8a6a3f]" />
            <h2 className="truncate text-lg font-black text-[#24190f]">月別予算</h2>
          </div>
        </div>
        <BudgetGroup
          title="収入"
          rows={incomeBudgets}
          drafts={drafts}
          onChangeBudget={handleChangeBudget}
          savingCategory={savingCategory}
        />
        <BudgetGroup
          title="支出"
          rows={expenseBudgets}
          drafts={drafts}
          onChangeBudget={handleChangeBudget}
          savingCategory={savingCategory}
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
  savingCategory,
}: {
  title: string;
  rows: HouseholdBudget[];
  drafts: Record<string, string>;
  onChangeBudget: (category: string, value: string) => Promise<void>;
  savingCategory: string | null;
}) {
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
            <BudgetSelect
              value={toDigits(drafts[budget.category] ?? "0")}
              disabled={savingCategory !== null}
              onChange={(value) => onChangeBudget(budget.category, value)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

const BudgetSelect = memo(function BudgetSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const numericValue = Number(toDigits(value || "0"));
  const options =
    expanded && !BUDGET_OPTIONS.includes(numericValue)
      ? [...BUDGET_OPTIONS, numericValue].sort((a, b) => a - b)
      : expanded
        ? BUDGET_OPTIONS
        : [numericValue];

  return (
    <select
      value={String(numericValue)}
      disabled={disabled}
      onFocus={() => setExpanded(true)}
      onPointerDown={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      onChange={(event) => {
        setExpanded(false);
        onChange(event.target.value);
      }}
      className="h-10 rounded-md border border-[#d7c7aa] bg-white px-2 text-right text-sm font-bold text-[#24190f] disabled:opacity-60"
    >
      {options.map((option) => (
        <option key={option} value={String(option)}>
          {yen(option)}
        </option>
      ))}
    </select>
  );
});
