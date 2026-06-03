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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    <main className="min-h-screen bg-[#f7f3eb] px-6 py-10 text-[#1f2933]">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-[#e6dcc8] bg-white p-8 shadow-sm">
          <p className="text-xs font-bold tracking-[0.2em] text-[#8a6a3f]">HOUSEHOLD BOOK</p>
          <h1 className="mt-2 text-2xl font-bold text-[#24190f]">ログイン</h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">この家計簿アプリを開くにはパスワードを入力してください。</p>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-bold text-[#4b5563]">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-lg border border-[#d7c7aa] bg-white px-3 text-base font-bold text-[#24190f] outline-none focus:border-[#8a6a3f]"
              autoFocus
            />
          </label>

          {error && <div className="mt-4 rounded-lg border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm font-bold text-[#b42318]">{error}</div>}

          <button type="submit" className="mt-6 w-full rounded-lg bg-[#5b4630] py-3 text-sm font-bold text-white hover:bg-[#3f3020]">
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
