import { defaultBudgets } from "./categories";
import { getMonthRange } from "./utils";
import { isSupabaseEnabled, supabase } from "./supabase";
import type { HouseholdBudget, HouseholdTransaction } from "@/types/household";

const STORAGE_TRANSACTIONS = "household.transactions.v1";
const STORAGE_BUDGETS = "household.budgets.v1";
const USER_KEY = "personal";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeTransaction(row: any): HouseholdTransaction {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    category: row.category,
    subcategory: row.subcategory ?? "",
    amount: Number(row.amount),
    memo: row.memo ?? "",
    created_at: row.created_at,
  };
}

export async function getTransactions(month: string): Promise<HouseholdTransaction[]> {
  if (isSupabaseEnabled && supabase) {
    const { start, end } = getMonthRange(month);
    const { data, error } = await supabase
      .from("household_transactions")
      .select("id,date,type,category,subcategory,amount,memo,created_at")
      .eq("user_key", USER_KEY)
      .gte("date", start)
      .lt("date", end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(normalizeTransaction);
  }

  return readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, [])
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => `${b.date}${b.created_at ?? ""}`.localeCompare(`${a.date}${a.created_at ?? ""}`));
}

export async function addTransaction(input: Omit<HouseholdTransaction, "id" | "created_at">) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from("household_transactions").insert({
      user_key: USER_KEY,
      date: input.date,
      type: input.type,
      category: input.category,
      subcategory: input.subcategory || null,
      amount: input.amount,
      memo: input.memo || null,
    });
    if (error) throw error;
    return;
  }

  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  rows.unshift({ ...input, id: makeId(), created_at: new Date().toISOString() });
  writeLocal(STORAGE_TRANSACTIONS, rows);
}

export async function addTransactions(inputs: Array<Omit<HouseholdTransaction, "id" | "created_at">>) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from("household_transactions").insert(
      inputs.map((input) => ({
        user_key: USER_KEY,
        date: input.date,
        type: input.type,
        category: input.category,
        subcategory: input.subcategory || null,
        amount: input.amount,
        memo: input.memo || null,
      }))
    );
    if (error) throw error;
    return;
  }

  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  const next = inputs.map((input) => ({ ...input, id: makeId(), created_at: new Date().toISOString() }));
  writeLocal(STORAGE_TRANSACTIONS, [...next, ...rows]);
}

export async function deleteTransaction(id: string) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from("household_transactions").delete().eq("id", id).eq("user_key", USER_KEY);
    if (error) throw error;
    return;
  }

  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  writeLocal(
    STORAGE_TRANSACTIONS,
    rows.filter((row) => row.id !== id)
  );
}

export async function getBudgets(month: string): Promise<HouseholdBudget[]> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("household_budgets")
      .select("id,month,category,budget")
      .eq("user_key", USER_KEY)
      .eq("month", month);
    if (error) throw error;
    const saved = (data ?? []) as HouseholdBudget[];
    return mergeDefaultBudgets(month, saved);
  }

  const saved = readLocal<HouseholdBudget[]>(STORAGE_BUDGETS, []).filter((b) => b.month === month);
  return mergeDefaultBudgets(month, saved);
}

export async function saveBudgets(month: string, budgets: HouseholdBudget[]) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from("household_budgets").upsert(
      budgets.map((budget) => ({
        user_key: USER_KEY,
        month,
        category: budget.category,
        budget: budget.budget,
      })),
      { onConflict: "user_key,month,category" }
    );
    if (error) throw error;
    return;
  }

  const rows = readLocal<HouseholdBudget[]>(STORAGE_BUDGETS, []);
  const otherMonths = rows.filter((b) => b.month !== month);
  writeLocal(STORAGE_BUDGETS, [...otherMonths, ...budgets.map((b) => ({ ...b, month }))]);
}

function mergeDefaultBudgets(month: string, saved: HouseholdBudget[]) {
  const byCategory = new Map(saved.map((b) => [b.category, b]));
  return Object.entries(defaultBudgets).map(([category, budget]) => ({
    id: byCategory.get(category)?.id,
    month,
    category,
    budget: byCategory.get(category)?.budget ?? budget,
  }));
}
