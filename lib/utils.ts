import { expenseCategories, incomeCategories } from "./categories";
import type { HouseholdBudget, HouseholdTransaction, SummaryRow } from "@/types/household";

export function yen(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function currentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

export function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = `${year}-${pad2(monthIndex)}-01`;
  const endDate = new Date(year, monthIndex, 1);
  const end = `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(endDate.getDate())}`;
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
