import type { HouseholdTransaction, TransactionType } from "@/types/household";

export type AppTab = "home" | "input" | "budget" | "history" | "profile";

export type TemplateDraft = {
  id: string;
  type: TransactionType;
  category: string;
  subcategory: string;
  amount: string;
  enabled: boolean;
};

export type CategoryOverview = {
  type: TransactionType;
  category: string;
  budget: number;
  actual: number;
  diff: number;
};

export type MonthOverview = {
  month: string;
  incomeBudget: number;
  expenseBudget: number;
  incomeActual: number;
  expenseActual: number;
  balance: number;
  categoryRows: CategoryOverview[];
};
