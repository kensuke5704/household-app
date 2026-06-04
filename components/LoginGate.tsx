"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

const ACTIVE_USER_KEY = "household.auth.userKey";
const ACTIVE_EMAIL_KEY = "household.auth.email";
const LOCAL_USERS_KEY = "household.auth.localUsers.v1";

type Mode = "login" | "signup";
type LocalUser = {
  email: string;
  password: string;
  userKey: string;
};

function makeUserKey(email: string) {
  const normalized = email.trim().toLowerCase();
  return `local-${normalized.replace(/[^a-z0-9._-]/gi, "_")}`;
}

function readLocalUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
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

function setActiveUser(userKey: string, email: string) {
  window.localStorage.setItem(ACTIVE_USER_KEY, userKey);
  window.localStorage.setItem(ACTIVE_EMAIL_KEY, email);
}

export default function LoginGate({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeEmail, setActiveEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        if (isSupabaseEnabled && supabase) {
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          if (!cancelled && session?.user) {
            const sessionEmail = session.user.email || "";
            setActiveUser(session.user.id, sessionEmail);
            setActiveEmail(sessionEmail);
            setIsUnlocked(true);
            return;
          }
        }

        const savedUserKey = window.localStorage.getItem(ACTIVE_USER_KEY);
        const savedEmail = window.localStorage.getItem(ACTIVE_EMAIL_KEY) || "";
        if (!cancelled && savedUserKey) {
          setActiveEmail(savedEmail);
          setIsUnlocked(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      setLoading(true);

      if (isSupabaseEnabled && supabase) {
        if (mode === "signup") {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
          });
          if (signUpError) throw signUpError;
          const user = data.user;
          if (!user) {
            setError("登録確認メールを送信しました。確認後にログインしてください。");
            return;
          }
          setActiveUser(user.id, normalizedEmail);
        } else {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          if (signInError) throw signInError;
          if (!data.user) throw new Error("ログインに失敗しました");
          setActiveUser(data.user.id, normalizedEmail);
        }
      } else {
        const users = readLocalUsers();
        const existing = users.find((user) => user.email === normalizedEmail);

        if (mode === "signup") {
          if (existing) {
            setError("このメールアドレスは登録済みです");
            return;
          }
          const user: LocalUser = {
            email: normalizedEmail,
            password,
            userKey: makeUserKey(normalizedEmail),
          };
          writeLocalUsers([...users, user]);
          setActiveUser(user.userKey, user.email);
        } else {
          if (!existing || existing.password !== password) {
            setError("メールアドレスまたはパスワードが違います");
            return;
          }
          setActiveUser(existing.userKey, existing.email);
        }
      }

      setActiveEmail(normalizedEmail);
      setIsUnlocked(true);
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "認証に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
    }
    window.localStorage.removeItem(ACTIVE_USER_KEY);
    window.localStorage.removeItem(ACTIVE_EMAIL_KEY);
    setIsUnlocked(false);
    setActiveEmail("");
    setPassword("");
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
          <span className="max-w-[150px] truncate">{activeEmail}</span>
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
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-between px-5 pb-[max(22px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#eadfca] opacity-70 blur-3xl" />

        <header className="relative pt-5 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] border border-[#e6dcc8] bg-white shadow-sm">
            <span className="text-3xl">家</span>
          </div>
          <p className="mt-5 text-[11px] font-black tracking-[0.28em] text-[#8a6a3f]">
            HOUSEHOLD BOOK
          </p>
          <h1 className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#24190f]">
            {isLogin ? "ログイン" : "新規登録"}
          </h1>
          <p className="mx-auto mt-3 max-w-[280px] text-sm font-bold leading-relaxed text-[#7a7166]">
            家計簿データをユーザーごとに分けて管理します。
          </p>
        </header>

        <section className="relative mt-8 rounded-[30px] border border-[#e6dcc8] bg-white/95 p-4 shadow-[0_18px_50px_rgba(91,70,48,0.12)] backdrop-blur">
          <div className="mb-4 grid grid-cols-2 rounded-[20px] bg-[#f4efe5] p-1">
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
            <label className="block">
              <span className="mb-2 block px-1 text-xs font-black text-[#7a7166]">
                メールアドレス
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none transition placeholder:text-[#c1b6a6] focus:border-[#8a6a3f] focus:bg-white focus:ring-4 focus:ring-[#eadfca]"
                autoComplete="email"
                inputMode="email"
                placeholder="example@email.com"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="mb-2 block px-1 text-xs font-black text-[#7a7166]">
                パスワード
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none transition placeholder:text-[#c1b6a6] focus:border-[#8a6a3f] focus:bg-white focus:ring-4 focus:ring-[#eadfca]"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="8文字以上を推奨"
              />
            </label>

            {error && (
              <p className="rounded-[18px] border border-[#ffd8d2] bg-[#fff0ed] px-4 py-3 text-sm font-bold leading-relaxed text-[#b42318]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-14 w-full rounded-[20px] bg-[#5b4630] text-base font-black text-white shadow-[0_12px_24px_rgba(91,70,48,0.22)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "処理中..." : isLogin ? "ログインする" : "登録して始める"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] font-bold leading-relaxed text-[#8a7b68]">
            {isSupabaseEnabled
              ? "登録後、確認メールが届く場合があります。"
              : "ローカル環境では端末内にユーザー情報を保存します。"}
          </p>
        </section>

        <footer className="relative mt-6 text-center text-[11px] font-bold text-[#9b8f7d]">
          Household App
        </footer>
      </div>
    </main>
  );
}
