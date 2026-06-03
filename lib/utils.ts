import { expenseCategories, incomeCategories } from "./categories";
import type { HouseholdBudget, HouseholdTransaction, SummaryRow } from "@/types/household";

export function yen(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthString() {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthRange(month: string) {
  const start = `${month}-01`;
  const endDate = new Date(`${month}-01T00:00:00`);
  endDate.setMonth(endDate.getMonth() + 1);
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

export function isInMonth(date: string, month: string) {
  return date.startsWith(month);
}

export function totalByType(transactions: HouseholdTransaction[], type: "income" | "expense") {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export function makeSummaryRows(
  transactions: HouseholdTransaction[],
  budgets: HouseholdBudget[],
  type: "income" | "expense"
): SummaryRow[] {
  const categories = type === "income" ? incomeCategories : expenseCategories;
  return categories.map((category) => {
    const budget = budgets.find((b) => b.category === category)?.budget ?? 0;
    const actual = transactions
      .filter((t) => t.type === type && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    const diff = type === "income" ? actual - budget : budget - actual;
    return { category, budget, actual, diff };
  });
}
