import { defaultBudgets } from "./categories";
import { initialHouseholdBudgets, initialHouseholdTransactions } from "./initialHouseholdData";
import { getMonthRange } from "./utils";
import { isSupabaseEnabled, supabase } from "./supabase";
import type { HouseholdBudget, HouseholdTransaction } from "@/types/household";

const STORAGE_TRANSACTIONS = "household.transactions.v1";
const STORAGE_BUDGETS = "household.budgets.v1";
const STORAGE_INITIAL_SEED = "household.initialData.seeded.v1";
const ACTIVE_USER_KEY = "household.auth.userKey";
const FALLBACK_USER_KEY = "personal";
const INITIAL_DATA_USER_KEY = "kensuke5704";

function getUserKey() {
  if (typeof window === "undefined") return FALLBACK_USER_KEY;
  return window.localStorage.getItem(ACTIVE_USER_KEY) || FALLBACK_USER_KEY;
}

function scopedLocalKey(key: string) {
  return `${key}.${getUserKey()}`;
}


function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(scopedLocalKey(key));
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(scopedLocalKey(key), JSON.stringify(value));
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


export async function seedInitialHouseholdData() {
  if (typeof window === "undefined") return false;

  const userKey = getUserKey();
  if (userKey !== INITIAL_DATA_USER_KEY) return false;

  const markerKey = scopedLocalKey(STORAGE_INITIAL_SEED);
  if (window.localStorage.getItem(markerKey) === "true") return false;

  if (isSupabaseEnabled && supabase) {
    const { count, error: countError } = await supabase
      .from("household_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_key", userKey)
      .eq("memo", "excel-seed");

    if (countError) throw countError;
    if ((count ?? 0) > 0) {
      window.localStorage.setItem(markerKey, "true");
      return false;
    }

    const { error: transactionError } = await supabase.from("household_transactions").insert(
      initialHouseholdTransactions.map((input) => ({
        user_key: userKey,
        date: input.date,
        type: input.type,
        category: input.category,
        subcategory: input.subcategory || null,
        amount: input.amount,
        memo: "excel-seed",
      })),
    );
    if (transactionError) throw transactionError;

    const { error: budgetError } = await supabase.from("household_budgets").upsert(
      initialHouseholdBudgets.map((budget) => ({
        user_key: userKey,
        month: budget.month,
        category: budget.category,
        budget: budget.budget,
      })),
      { onConflict: "user_key,month,category" },
    );
    if (budgetError) throw budgetError;

    window.localStorage.setItem(markerKey, "true");
    return true;
  }

  const existingTransactions = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  const hasSeededTransactions = existingTransactions.some((row) => row.memo === "excel-seed");

  if (!hasSeededTransactions) {
    const seededTransactions = initialHouseholdTransactions.map((input) => ({
      ...input,
      id: makeId(),
      memo: "excel-seed",
      created_at: new Date().toISOString(),
    }));
    writeLocal(STORAGE_TRANSACTIONS, [...seededTransactions, ...existingTransactions]);
  }

  const existingBudgets = readLocal<HouseholdBudget[]>(STORAGE_BUDGETS, []);
  const seededMonths = new Set(initialHouseholdBudgets.map((budget) => budget.month));
  const categoriesByMonth = new Set(
    initialHouseholdBudgets.map((budget) => `${budget.month}:${budget.category}`),
  );
  const preservedBudgets = existingBudgets.filter(
    (budget) => !seededMonths.has(budget.month) || !categoriesByMonth.has(`${budget.month}:${budget.category}`),
  );
  writeLocal(STORAGE_BUDGETS, [...preservedBudgets, ...initialHouseholdBudgets]);

  window.localStorage.setItem(markerKey, "true");
  return !hasSeededTransactions;
}

export async function getTransactions(month: string): Promise<HouseholdTransaction[]> {
  if (isSupabaseEnabled && supabase) {
    const { start, end } = getMonthRange(month);
    const { data, error } = await supabase
      .from("household_transactions")
      .select("id,date,type,category,subcategory,amount,memo,created_at")
      .eq("user_key", getUserKey())
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
      user_key: getUserKey(),
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
        user_key: getUserKey(),
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
    const { error } = await supabase.from("household_transactions").delete().eq("id", id).eq("user_key", getUserKey());
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
      .eq("user_key", getUserKey())
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
        user_key: getUserKey(),
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

export async function updateTransaction(id: string, input: Partial<Omit<HouseholdTransaction, "id" | "created_at">>) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase
      .from("household_transactions")
      .update({
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.subcategory !== undefined ? { subcategory: input.subcategory || null } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.memo !== undefined ? { memo: input.memo || null } : {}),
      })
      .eq("id", id)
      .eq("user_key", getUserKey());
    if (error) throw error;
    return;
  }

  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  writeLocal(
    STORAGE_TRANSACTIONS,
    rows.map((row) => (row.id === id ? { ...row, ...input } : row)),
  );
}
