"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import BackupControls from "@/components/BackupControls";

const ACTIVE_USER_KEY = "household.auth.userKey";
const ACTIVE_ID_KEY = "household.auth.id";
const LEGACY_ACTIVE_ID_KEY = "household.auth.email";
const LOCAL_USERS_KEY = "household.auth.localUsers.v3";
const LEGACY_LOCAL_USERS_KEY = "household.auth.localUsers.v2";

type Mode = "login" | "signup";
type LocalUser = {
  id: string;
  userKey: string;
  createdAt: string;
};

function normalizeUserId(value: string) {
  return value.trim();
}

function makeUserKey(id: string) {
  const normalized = normalizeUserId(id).toLowerCase();
  return `id-${normalized.replace(/[^a-z0-9._-]/gi, "_")}`;
}

function readLocalUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY) || window.localStorage.getItem(LEGACY_LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function setActiveUser(userKey: string, id: string) {
  window.localStorage.setItem(ACTIVE_USER_KEY, userKey);
  window.localStorage.setItem(ACTIVE_ID_KEY, id);
  window.localStorage.setItem(LEGACY_ACTIVE_ID_KEY, id);
}

export default function LoginGate({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const savedUserKey = window.localStorage.getItem(ACTIVE_USER_KEY);
    const savedId = window.localStorage.getItem(ACTIVE_ID_KEY) || window.localStorage.getItem(LEGACY_ACTIVE_ID_KEY) || "";
    if (savedUserKey) {
      setActiveId(savedId);
      setIsUnlocked(true);
    }
    setLoading(false);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) {
      setError("IDを入力してください");
      return;
    }

    setLoading(true);

    try {
      const users = readLocalUsers();
      const existing = users.find((user) => user.id === normalizedId);

      if (mode === "signup") {
        if (existing) {
          setError("このIDは登録済みです");
          return;
        }
        const user: LocalUser = {
          id: normalizedId,
          userKey: makeUserKey(normalizedId),
          createdAt: new Date().toISOString(),
        };
        writeLocalUsers([...users, user]);
        setActiveUser(user.userKey, user.id);
        setActiveId(user.id);
      } else {
        if (!existing) {
          setError("この端末にIDがありません。機種変更時は下のバックアップから復元してください");
          return;
        }
        setActiveUser(existing.userKey, existing.id);
        setActiveId(existing.id);
      }

      setIsUnlocked(true);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "処理に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(ACTIVE_USER_KEY);
    window.localStorage.removeItem(ACTIVE_ID_KEY);
    window.localStorage.removeItem(LEGACY_ACTIVE_ID_KEY);
    setIsUnlocked(false);
    setActiveId("");
    setUserId("");
    window.location.reload();
  }

  if (loading && !isUnlocked) {
    return (
      <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#f7f3eb] px-5">
        <div className="flex flex-col items-center gap-3 text-[#5b4630]">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-[#e6dcc8]" />
          <p className="text-sm font-black">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  const isLogin = mode === "login";

  return (
    <main className="min-h-[100dvh] w-full bg-[#f7f3eb] px-3 py-4 text-[#24190f]">
      <div className="mx-auto flex min-h-[calc(100dvh-32px)] w-full max-w-md flex-col justify-center">
        <section className="rounded-[28px] border border-[#e6dcc8] bg-white p-4 shadow-sm">
          <div className="mb-5 grid grid-cols-2 rounded-[20px] bg-[#f4efe5] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`h-11 rounded-[16px] text-sm font-black transition ${
                isLogin ? "bg-white text-[#24190f] shadow-sm" : "text-[#8a7b68]"
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`h-11 rounded-[16px] text-sm font-black transition ${
                !isLogin ? "bg-white text-[#24190f] shadow-sm" : "text-[#8a7b68]"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none transition placeholder:text-[#c1b6a6] focus:border-[#8a6a3f] focus:bg-white focus:ring-4 focus:ring-[#eadfca]"
              autoComplete="username"
              inputMode="text"
              placeholder="ID"
              autoFocus
            />

            {error && (
              <p className="rounded-[18px] border border-[#ffd8d2] bg-[#fff0ed] px-4 py-3 text-sm font-bold leading-relaxed text-[#b42318]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-[#5b4630] text-base font-black text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "処理中..." : isLogin ? "ログイン" : "登録"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-bold text-[#a09382]">
            <span className="h-px flex-1 bg-[#e6dcc8]" />
            機種変更・別端末
            <span className="h-px flex-1 bg-[#e6dcc8]" />
          </div>
          <BackupControls allowExport={false} />
          <p className="mt-3 text-center text-xs font-bold leading-relaxed text-[#8a7b68]">
            以前の端末で書き出したJSONファイルを選びます
          </p>
        </section>
      </div>
    </main>
  );
}
