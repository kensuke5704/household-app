import type { ReactNode } from "react";
import { WalletCards } from "lucide-react";
import { yen } from "@/lib/utils";
import type { SummaryRow } from "@/types/household";

export default function BudgetTab({
  incomeRows,
  expenseRows,
  children,
}: {
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <BudgetBreakdownPieCard incomeRows={incomeRows} expenseRows={expenseRows} />
      {children}
    </div>
  );
}

function BudgetBreakdownPieCard({
  incomeRows,
  expenseRows,
}: {
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
}) {
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <WalletCards size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">予算内訳</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <BudgetCategoryDonut label="収入" rows={incomeRows} tone="green" />
        <BudgetCategoryDonut label="支出" rows={expenseRows} tone="red" />
      </div>
    </div>
  );
}

function BudgetCategoryDonut({
  label,
  rows,
  tone,
}: {
  label: string;
  rows: SummaryRow[];
  tone: "green" | "red";
}) {
  const palette =
    tone === "green"
      ? [
          "#2f6f4e",
          "#4f8f67",
          "#6fa981",
          "#8fbf9a",
          "#a9d0b0",
          "#3f766f",
          "#5e9488",
          "#7fb0a4",
          "#9bc8bb",
          "#bdddd4",
          "#6b7f3f",
          "#899c5a",
        ]
      : [
          "#9f4f45",
          "#b9665b",
          "#cf7f72",
          "#df9a8f",
          "#e9b4aa",
          "#8f5f3c",
          "#a8774d",
          "#bf9364",
          "#d2aa7d",
          "#e2c29c",
          "#8f4f6f",
          "#ad6f8d",
        ];
  const budgetRows = rows.filter((row) => row.budget > 0);
  const total = budgetRows.reduce((sum, row) => sum + row.budget, 0);
  let cursor = 0;
  const segments = budgetRows.map((row, index) => {
    const start = cursor;
    const end = start + (row.budget / Math.max(total, 1)) * 100;
    cursor = end;
    return `${palette[index % palette.length]} ${start}% ${end}%`;
  });
  const background =
    total > 0 ? `conic-gradient(${segments.join(", ")})` : "#eee4d2";

  return (
    <div className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
      <div
        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full"
        style={{ background }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-xs font-black text-[#6b7280]">{label}</span>
          <span className="text-sm font-black text-[#24190f]">{yen(total)}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {budgetRows.map((row, index) => (
          <div
            key={row.category}
            className="flex items-center justify-between gap-2 text-[11px] font-bold"
          >
            <span className="min-w-0 truncate text-[#5b4630]">
              <span
                className="mr-1 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              {row.category}
            </span>
            <span className="shrink-0 text-[#24190f]">{yen(row.budget)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
