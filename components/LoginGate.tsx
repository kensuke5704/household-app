"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "household_app_login_ok";
const DEFAULT_PASSWORD = "household";

export default function LoginGate({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "true") {
      setIsUnlocked(true);
    }
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const appPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || DEFAULT_PASSWORD;

    if (password === appPassword) {
      window.localStorage.setItem(STORAGE_KEY, "true");
      setIsUnlocked(true);
      setError("");
      return;
    }

    setError("パスワードが違います");
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#f7f3eb] px-3 py-4 sm:px-6">
      <section className="w-full max-w-[390px] rounded-[24px] border border-[#e6dcc8] bg-white px-4 py-6 shadow-sm sm:max-w-[420px] sm:rounded-[28px] sm:px-8 sm:py-9">
        <div className="mb-5 text-center sm:mb-6">
          <p className="text-[11px] font-black tracking-[0.28em] text-[#8a6a3f]">
            HOUSEHOLD BOOK
          </p>
          <h1 className="mt-2 text-[26px] font-black leading-tight text-[#24190f] sm:text-3xl">
            ログイン
          </h1>
          <p className="mt-2 text-sm font-bold leading-relaxed text-[#6b7280] sm:mt-3">
            この家計簿アプリを開くにはパスワードを入力してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6b7280]">
              パスワード
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-[52px] min-h-[52px] w-full rounded-2xl border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-base font-bold text-[#24190f] outline-none focus:border-[#8a6a3f] focus:bg-white sm:h-14"
              autoComplete="current-password"
              autoFocus
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#b42318]">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="h-[52px] min-h-[52px] w-full rounded-2xl bg-[#5b4630] text-base font-black text-white active:scale-[0.99] sm:h-14"
          >
            ログイン
          </button>
        </form>
      </section>
    </main>
  );
}
