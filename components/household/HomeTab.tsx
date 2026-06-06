import { BarChart3 } from "lucide-react";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { yen } from "@/lib/utils";
import type { HouseholdBudget, SummaryRow, TransactionType } from "@/types/household";

function signedYen(value: number) {
  return `${value >= 0 ? "+" : "-"}${yen(Math.abs(value))}`;
}

export default function HomeTab({
  income,
  expense,
  budgets,
  incomeRows,
  expenseRows,
}: {
  income: number;
  expense: number;
  budgets: HouseholdBudget[];
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
}) {
  const incomeBudget = budgets
    .filter((b) => incomeCategories.includes(b.category as any))
    .reduce((sum, b) => sum + b.budget, 0);
  const expenseBudget = budgets
    .filter((b) => expenseCategories.includes(b.category as any))
    .reduce((sum, b) => sum + b.budget, 0);

  return (
    <div className="space-y-4">
      <BudgetActualGraphCard
        title="収支"
        incomeBudget={incomeBudget}
        incomeActual={income}
        expenseBudget={expenseBudget}
        expenseActual={expense}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SummaryTable title="収入の予算比較" rows={incomeRows} type="income" />
        <SummaryTable
          title="支出の予算比較"
          rows={expenseRows}
          type="expense"
        />
      </div>
    </div>
  );
}

function BudgetActualGraphCard({
  title,
  incomeBudget,
  incomeActual,
  expenseBudget,
  expenseActual,
}: {
  title: string;
  incomeBudget: number;
  incomeActual: number;
  expenseBudget: number;
  expenseActual: number;
}) {
  const maxValue = Math.max(
    incomeBudget,
    incomeActual,
    expenseBudget,
    expenseActual,
    1,
  );
  const actualBalance =
    incomeActual - incomeBudget - (expenseActual - expenseBudget);

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[#8a6a3f]" />
          <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
        </div>
        <div className="hidden rounded-full bg-[#f3eadb] px-3 py-1 text-xs font-black text-[#5b4630] sm:block">
          中央が0円
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
        <p className="text-xs font-black text-[#6b7280]">対予算</p>
        <p
          className={`mt-1 text-2xl font-black ${
            actualBalance < 0 ? "text-[#b42318]" : "text-[#047857]"
          }`}
        >
          {signedYen(actualBalance)}
        </p>
      </div>

      <div className="space-y-5">
        <CenterBarRow
          label="予算"
          leftLabel="収入予算"
          rightLabel="支出予算"
          leftValue={incomeBudget}
          rightValue={expenseBudget}
          maxValue={maxValue}
        />
        <CenterBarRow
          label="実績"
          leftLabel="収入実績"
          rightLabel="支出実績"
          leftValue={incomeActual}
          rightValue={expenseActual}
          maxValue={maxValue}
        />
      </div>
    </div>
  );
}

function CenterBarRow({
  label,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  maxValue,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  maxValue: number;
}) {
  const leftWidth = Math.min(100, (leftValue / maxValue) * 100);
  const rightWidth = Math.min(100, (rightValue / maxValue) * 100);

  return (
    <div className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
      <div className="mb-2 flex items-center justify-center">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#5b4630] shadow-sm">
          {label}
        </span>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-3 text-xs font-black text-[#6b7280]">
        <span className="text-left">
          {leftLabel}
          <br />
          <span className="text-[#047857]">{yen(leftValue)}</span>
        </span>
        <span className="text-right">
          {rightLabel}
          <br />
          <span className="text-[#b42318]">{yen(rightValue)}</span>
        </span>
      </div>

      <div className="relative grid h-10 grid-cols-2 overflow-hidden rounded-full bg-[#eee4d2]">
        <div className="relative flex justify-end border-r border-white/90">
          <div
            className="h-full rounded-l-full bg-[#a7c4ad]"
            style={{ width: `${leftWidth}%` }}
          />
        </div>
        <div className="relative flex justify-start">
          <div
            className="h-full rounded-r-full bg-[#d7a19a]"
            style={{ width: `${rightWidth}%` }}
          />
        </div>
        <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-white" />
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#5b4630]" />
      </div>
    </div>
  );
}

function SummaryTable({
  title,
  rows,
  type,
}: {
  title: string;
  rows: SummaryRow[];
  type: TransactionType;
}) {
  const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalDiff =
    type === "income" ? totalActual - totalBudget : totalBudget - totalActual;
  const diffLabel = type === "expense" ? "残り" : "差額";
  const totalLabel = type === "expense" ? "合計残り" : "合計差額";

  return (
    <details className="rounded-2xl border border-[#e6dcc8] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-[#eee4d2] px-4 py-3 text-left sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[#8a6a3f]" />
          <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
        </div>
        <span
          className={
            totalDiff < 0
              ? "text-sm font-black text-[#b42318]"
              : "text-sm font-black text-[#047857]"
          }
        >
          {signedYen(totalDiff)}
        </span>
      </summary>
      <div className="space-y-2 p-3">
        {rows.map((row) => (
          <div
            key={row.category}
            className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-black text-[#24190f]">{row.category}</p>
              <div className="text-right">
                <p className="text-[11px] font-black text-[#6b7280]">
                  {diffLabel}
                </p>
                <p
                  className={`font-black ${
                    row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"
                  }`}
                >
                  {signedYen(row.diff)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2">
              <MiniStat label="予算" value={row.budget} />
              <MiniStat label="実績" value={row.actual} />
            </div>
          </div>
        ))}
        <div className="rounded-xl border-2 border-[#e6dcc8] bg-white p-4">
          <div className="flex items-center justify-between font-black">
            <span>{totalLabel}</span>
            <span className={totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"}>
              {signedYen(totalDiff)}
            </span>
          </div>
        </div>
      </div>
    </details>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white p-2">
      <p className="text-xs font-bold text-[#6b7280]">{label}</p>
      <p className="font-bold text-[#24190f]">{yen(value)}</p>
    </div>
  );
}
