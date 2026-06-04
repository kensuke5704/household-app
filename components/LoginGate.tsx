"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

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

async function findRemoteUser(id: string) {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from("household_users")
    .select("id,user_key")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; user_key: string } | null;
}

async function createRemoteUser(id: string) {
  if (!isSupabaseEnabled || !supabase) return null;
  const userKey = makeUserKey(id);
  const { data, error } = await supabase
    .from("household_users")
    .insert({ id, user_key: userKey })
    .select("id,user_key")
    .single();
  if (error) throw error;
  return data as { id: string; user_key: string };
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
      if (isSupabaseEnabled && supabase) {
        const existing = await findRemoteUser(normalizedId);

        if (mode === "signup") {
          if (existing) {
            setError("このIDは登録済みです");
            return;
          }
          const created = await createRemoteUser(normalizedId);
          if (!created) throw new Error("登録に失敗しました");
          setActiveUser(created.user_key, created.id);
          setActiveId(created.id);
        } else {
          if (!existing) {
            setError("このIDは登録されていません");
            return;
          }
          setActiveUser(existing.user_key, existing.id);
          setActiveId(existing.id);
        }
      } else {
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
            setError("このIDは登録されていません");
            return;
          }
          setActiveUser(existing.userKey, existing.id);
          setActiveId(existing.id);
        }
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
    return (
      <>
        <div className="fixed right-3 top-3 z-[70] flex max-w-[calc(100vw-24px)] items-center gap-2 rounded-full border border-[#e6dcc8] bg-white/90 px-3 py-2 text-[11px] font-black text-[#6b7280] shadow-sm backdrop-blur">
          <span className="max-w-[150px] truncate">{activeId}</span>
          <button type="button" onClick={handleLogout} className="shrink-0 text-[#5b4630]">
            ログアウト
          </button>
        </div>
        {children}
      </>
    );
  }

  const isLogin = mode === "login";

  return (
    <main className="min-h-[100dvh] w-full overflow-hidden bg-[#f7f3eb] text-[#24190f]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-center px-5 py-[max(22px,env(safe-area-inset-bottom))]">
        <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#eadfca] opacity-70 blur-3xl" />

        <section className="relative rounded-[30px] border border-[#e6dcc8] bg-white/95 p-4 shadow-[0_18px_50px_rgba(91,70,48,0.12)] backdrop-blur">
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
              className="h-14 w-full rounded-[20px] border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none transition placeholder:text-[#c1b6a6] focus:border-[#8a6a3f] focus:bg-white focus:ring-4 focus:ring-[#eadfca]"
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
              className="h-14 w-full rounded-[20px] bg-[#5b4630] text-base font-black text-white shadow-[0_12px_24px_rgba(91,70,48,0.22)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "処理中..." : isLogin ? "ログイン" : "登録"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
