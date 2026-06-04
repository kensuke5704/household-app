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
      <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#f7f3eb] px-4 py-6">
        <p className="text-sm font-black text-[#6b7280]">読み込み中...</p>
      </main>
    );
  }

  if (isUnlocked) {
    return (
      <>
        <div className="fixed right-3 top-3 z-[70] flex items-center gap-2 rounded-full border border-[#e6dcc8] bg-white/90 px-3 py-2 text-[11px] font-black text-[#6b7280] shadow-sm backdrop-blur">
          <span className="max-w-[140px] truncate">{activeEmail}</span>
          <button type="button" onClick={handleLogout} className="text-[#5b4630]">
            ログアウト
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#f7f3eb] px-4 py-6 sm:px-6">
      <section className="w-full max-w-[420px] rounded-[28px] border border-[#e6dcc8] bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-black tracking-[0.28em] text-[#8a6a3f]">
            HOUSEHOLD BOOK
          </p>
          <h1 className="mt-2 text-2xl font-black text-[#24190f] sm:text-3xl">
            {mode === "login" ? "ログイン" : "新規登録"}
          </h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#6b7280]">
            ユーザーごとに家計簿データを分けて保存します。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6b7280]">
              メールアドレス
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none focus:border-[#8a6a3f] focus:bg-white"
              autoComplete="email"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6b7280]">
              パスワード
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none focus:border-[#8a6a3f] focus:bg-white"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#b42318]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-2xl bg-[#5b4630] text-base font-black text-white active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "処理中..." : mode === "login" ? "ログイン" : "登録して始める"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "login" ? "signup" : "login"));
            setError("");
          }}
          className="mt-5 w-full text-center text-sm font-black text-[#5b4630]"
        >
          {mode === "login" ? "新規登録はこちら" : "ログインはこちら"}
        </button>
      </section>
    </main>
  );
}
