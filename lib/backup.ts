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

export type HouseholdBackup = {
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

export type AutomaticBackupInfo = {
  id: string;
  exportedAt: string;
  transactions: number;
  budgets: number;
};

type StoredAutomaticBackup = HouseholdBackup & {
  id: string;
};

const AUTO_BACKUP_DATABASE = "household-app-backups";
const AUTO_BACKUP_STORE = "snapshots";
const MAX_AUTO_BACKUPS = 10;

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

export async function shareBackup() {
  const backup = createBackup();
  const date = backup.exportedAt.slice(0, 10);
  const safeId = backup.profile.id.replace(/[^a-zA-Z0-9._-]/g, "_");
  const file = new File(
    [JSON.stringify(backup, null, 2)],
    `household-backup-${safeId}-${date}.json`,
    { type: "application/json" },
  );

  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({
      title: "家計簿バックアップ",
      text: "「ファイルに保存」からiCloud Driveへ保存してください。",
      files: [file],
    });
    return true;
  }

  downloadBackup();
  return false;
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

function applyBackup(backup: HouseholdBackup) {
  const users = readUsers().filter((user) => user.userKey !== backup.profile.userKey);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...users, backup.profile]));

  for (const key of SCOPED_KEYS) {
    const value = backup.data[key];
    if (typeof value === "string") localStorage.setItem(`${key}.${backup.profile.userKey}`, value);
  }

  localStorage.setItem(ACTIVE_USER_KEY, backup.profile.userKey);
  localStorage.setItem(ACTIVE_ID_KEY, backup.profile.id);
  localStorage.setItem(LEGACY_ACTIVE_ID_KEY, backup.profile.id);
  return {
    transactions: countRows<HouseholdTransaction>(backup.data["household.transactions.v1"] || null),
    budgets: countRows<HouseholdBudget>(backup.data["household.budgets.v1"] || null),
  };
}

export async function restoreBackup(file: File) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("JSONバックアップを読み込めませんでした");
  }
  if (!isBackup(parsed)) throw new Error("このアプリのバックアップ形式ではありません");
  return applyBackup(parsed);
}

function openBackupDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(AUTO_BACKUP_DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(AUTO_BACKUP_STORE)) {
        database.createObjectStore(AUTO_BACKUP_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("自動バックアップを開けませんでした"));
  });
}

async function readStoredBackups(): Promise<StoredAutomaticBackup[]> {
  const database = await openBackupDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(AUTO_BACKUP_STORE, "readonly");
    const request = transaction.objectStore(AUTO_BACKUP_STORE).getAll();
    request.onsuccess = () => resolve((request.result as StoredAutomaticBackup[]).sort((a, b) => b.exportedAt.localeCompare(a.exportedAt)));
    request.onerror = () => reject(request.error || new Error("自動バックアップを読み込めませんでした"));
    transaction.oncomplete = () => database.close();
  });
}

function backupFingerprint(backup: HouseholdBackup) {
  return JSON.stringify(backup.data);
}

export async function saveAutomaticBackup() {
  if (typeof indexedDB === "undefined") return false;
  const backup = createBackup();
  const existing = await readStoredBackups();
  const userBackups = existing.filter((item) => item.profile.userKey === backup.profile.userKey);
  if (userBackups[0] && backupFingerprint(userBackups[0]) === backupFingerprint(backup)) return false;

  const stored: StoredAutomaticBackup = {
    ...backup,
    id: `${backup.profile.userKey}:${backup.exportedAt}`,
  };
  const database = await openBackupDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(AUTO_BACKUP_STORE, "readwrite");
    const store = transaction.objectStore(AUTO_BACKUP_STORE);
    store.put(stored);
    for (const oldBackup of userBackups.slice(MAX_AUTO_BACKUPS - 1)) store.delete(oldBackup.id);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error || new Error("自動バックアップに失敗しました"));
  });
  window.dispatchEvent(new Event("household-auto-backup"));
  return true;
}

export async function listAutomaticBackups(): Promise<AutomaticBackupInfo[]> {
  const userKey = localStorage.getItem(ACTIVE_USER_KEY);
  if (!userKey || typeof indexedDB === "undefined") return [];
  const backups = await readStoredBackups();
  return backups
    .filter((backup) => backup.profile.userKey === userKey)
    .map((backup) => ({
      id: backup.id,
      exportedAt: backup.exportedAt,
      transactions: backup.summary.transactions,
      budgets: backup.summary.budgets,
    }));
}

export async function restoreAutomaticBackup(id: string) {
  const database = await openBackupDatabase();
  const backup = await new Promise<StoredAutomaticBackup | undefined>((resolve, reject) => {
    const transaction = database.transaction(AUTO_BACKUP_STORE, "readonly");
    const request = transaction.objectStore(AUTO_BACKUP_STORE).get(id);
    request.onsuccess = () => resolve(request.result as StoredAutomaticBackup | undefined);
    request.onerror = () => reject(request.error || new Error("自動バックアップを読み込めませんでした"));
    transaction.oncomplete = () => database.close();
  });
  if (!backup || !isBackup(backup)) throw new Error("自動バックアップが見つかりません");
  return applyBackup(backup);
}
