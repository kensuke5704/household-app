import { defaultBudgets } from "./categories";
import { initialHouseholdBudgets, initialHouseholdTransactions } from "./initialHouseholdData";
import type { HouseholdBudget, HouseholdTransaction } from "@/types/household";

const STORAGE_TRANSACTIONS = "household.transactions.v1";
const STORAGE_BUDGETS = "household.budgets.v1";
const STORAGE_INITIAL_SEED = "household.initialData.seeded.v1";
const ACTIVE_USER_KEY = "household.auth.userKey";
const FALLBACK_USER_KEY = "personal";
const INITIAL_DATA_USER_KEYS = new Set(["kensuke5704", "id-kensuke5704"]);

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
  window.dispatchEvent(new Event("household-data-changed"));
}

export async function seedInitialHouseholdData() {
  if (typeof window === "undefined") return false;

  const userKey = getUserKey();
  if (!INITIAL_DATA_USER_KEYS.has(userKey)) return false;

  const markerKey = scopedLocalKey(STORAGE_INITIAL_SEED);
  if (window.localStorage.getItem(markerKey) === "true") return false;

  const existingTransactions = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  const initialKeys = new Set(
    initialHouseholdTransactions.map(
      (row) => `${row.date}|${row.type}|${row.category}|${row.subcategory}|${row.amount}`,
    ),
  );
  const existingKeys = new Set(
    existingTransactions.map(
      (row) => `${row.date}|${row.type}|${row.category}|${row.subcategory}|${row.amount}`,
    ),
  );
  const missingTransactions = initialHouseholdTransactions.filter(
    (row) => !existingKeys.has(`${row.date}|${row.type}|${row.category}|${row.subcategory}|${row.amount}`),
  );

  if (missingTransactions.length > 0) {
    const seededTransactions = missingTransactions.map((input) => ({
      ...input,
      id: makeId(),
      memo: input.memo || "imported-data",
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
  return initialKeys.size > 0 && missingTransactions.length > 0;
}

export async function getTransactions(month: string): Promise<HouseholdTransaction[]> {
  return readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, [])
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => `${b.date}${b.created_at ?? ""}`.localeCompare(`${a.date}${a.created_at ?? ""}`));
}

export async function addTransaction(input: Omit<HouseholdTransaction, "id" | "created_at">) {
  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  rows.unshift({ ...input, id: makeId(), created_at: new Date().toISOString() });
  writeLocal(STORAGE_TRANSACTIONS, rows);
}

export async function addTransactions(inputs: Array<Omit<HouseholdTransaction, "id" | "created_at">>) {
  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  const next = inputs.map((input) => ({ ...input, id: makeId(), created_at: new Date().toISOString() }));
  writeLocal(STORAGE_TRANSACTIONS, [...next, ...rows]);
}

export async function deleteTransaction(id: string) {
  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  writeLocal(
    STORAGE_TRANSACTIONS,
    rows.filter((row) => row.id !== id)
  );
}

export async function getBudgets(month: string): Promise<HouseholdBudget[]> {
  const saved = readLocal<HouseholdBudget[]>(STORAGE_BUDGETS, []).filter((b) => b.month === month);
  return mergeDefaultBudgets(month, saved);
}

export async function saveBudgets(month: string, budgets: HouseholdBudget[]) {
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
  const rows = readLocal<HouseholdTransaction[]>(STORAGE_TRANSACTIONS, []);
  writeLocal(
    STORAGE_TRANSACTIONS,
    rows.map((row) => (row.id === id ? { ...row, ...input } : row)),
  );
}
