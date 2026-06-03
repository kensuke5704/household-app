export type TransactionType = "income" | "expense";

export type HouseholdTransaction = {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  subcategory: string;
  amount: number;
  memo?: string | null;
  created_at?: string;
};

export type HouseholdBudget = {
  id?: string;
  month: string;
  category: string;
  budget: number;
};

export type SummaryRow = {
  category: string;
  budget: number;
  actual: number;
  diff: number;
};
