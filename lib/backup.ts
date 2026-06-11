import type { HouseholdBudget, HouseholdTransaction } from "@/types/household";

const FORMAT = "household-app-backup";
const VERSION = 1;
const ACTIVE_USER_KEY = "household.auth.userKey";
const ACTIVE_ID_KEY = "household.auth.id";
const LEGACY_ACTIVE_ID_KEY = "household.auth.email";
const LOCAL_USERS_KEY = "household.auth.localUsers.v3";

const SCOPED_KEYS = [
  "household.transactions.v1",
  "household.budgets.v1",
  "household.initialData.seeded.v1",
  "household.recurringTemplates.v2",
  "household.recurringTemplates.v1",
  "household.recurringTemplates.globalEnabled.v1",
  "household.quickSubcategories.v1",
  "household.history.openYears.v1",
  "household.history.openMonths.v1",
] as const;

type LocalUser = {
  id: string;
  userKey: string;
  createdAt: string;
};

type HouseholdBackup = {
  format: typeof FORMAT;
  version: typeof VERSION;
  exportedAt: string;
  profile: LocalUser;
  data: Record<string, string>;
  summary: {
    transactions: number;
    budgets: number;
  };
};

function readUsers(): LocalUser[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function countRows<T>(raw: string | null): number {
  if (!raw) return 0;
  try {
    const rows = JSON.parse(raw) as T[];
    return Array.isArray(rows) ? rows.length : 0;
  } catch {
    return 0;
  }
}

export function createBackup(): HouseholdBackup {
  const userKey = localStorage.getItem(ACTIVE_USER_KEY);
  const id = localStorage.getItem(ACTIVE_ID_KEY) || localStorage.getItem(LEGACY_ACTIVE_ID_KEY);
  if (!userKey || !id) throw new Error("ログイン情報が見つかりません");

  const profile = readUsers().find((user) => user.userKey === userKey) || {
    id,
    userKey,
    createdAt: new Date().toISOString(),
  };
  const data: Record<string, string> = {};

  for (const key of SCOPED_KEYS) {
    const value = localStorage.getItem(`${key}.${userKey}`);
    if (value !== null) data[key] = value;
  }

  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    data,
    summary: {
      transactions: countRows<HouseholdTransaction>(data["household.transactions.v1"] || null),
      budgets: countRows<HouseholdBudget>(data["household.budgets.v1"] || null),
    },
  };
}

export function downloadBackup() {
  const backup = createBackup();
  const date = backup.exportedAt.slice(0, 10);
  const safeId = backup.profile.id.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `household-backup-${safeId}-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function isBackup(value: unknown): value is HouseholdBackup {
  if (!value || typeof value !== "object") return false;
  const backup = value as Partial<HouseholdBackup>;
  return (
    backup.format === FORMAT &&
    backup.version === VERSION &&
    typeof backup.profile?.id === "string" &&
    typeof backup.profile?.userKey === "string" &&
    Boolean(backup.data) &&
    typeof backup.data === "object"
  );
}

export async function restoreBackup(file: File) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("JSONバックアップを読み込めませんでした");
  }
  if (!isBackup(parsed)) throw new Error("このアプリのバックアップ形式ではありません");

  const users = readUsers().filter((user) => user.userKey !== parsed.profile.userKey);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...users, parsed.profile]));

  for (const key of SCOPED_KEYS) {
    const value = parsed.data[key];
    if (typeof value === "string") localStorage.setItem(`${key}.${parsed.profile.userKey}`, value);
  }

  localStorage.setItem(ACTIVE_USER_KEY, parsed.profile.userKey);
  localStorage.setItem(ACTIVE_ID_KEY, parsed.profile.id);
  localStorage.setItem(LEGACY_ACTIVE_ID_KEY, parsed.profile.id);
  return {
    transactions: countRows<HouseholdTransaction>(parsed.data["household.transactions.v1"] || null),
    budgets: countRows<HouseholdBudget>(parsed.data["household.budgets.v1"] || null),
  };
}
