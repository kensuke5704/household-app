import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import BackupControls from "@/components/BackupControls";

export default function ProfileTab() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setActiveId(window.localStorage.getItem("household.auth.id") || window.localStorage.getItem("household.auth.email") || "");
  }, []);

  function handleLogout() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("household.auth.userKey");
    window.localStorage.removeItem("household.auth.id");
    window.localStorage.removeItem("household.auth.email");
    window.location.reload();
  }

  return (
    <section className="rounded-[28px] border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eadb] text-[#5b4630]">
          <UserRound size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-[#8a7b68]">ログイン中</p>
          <p className="truncate text-xl font-black text-[#24190f]">{activeId || "未設定"}</p>
        </div>
      </div>

      <div className="mb-5 rounded-[22px] bg-[#f7f3eb] p-4">
        <p className="mb-1 text-sm font-black text-[#24190f]">データの引き継ぎ</p>
        <p className="mb-4 text-xs font-bold leading-relaxed text-[#8a7b68]">
          機種変更前に書き出し、ファイルをiCloud DriveやGoogle Driveなどへ保管してください。
        </p>
        <BackupControls />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#5b4630] text-sm font-black text-white shadow-sm active:scale-[0.99]"
      >
        <LogOut size={17} />
        ログアウト
      </button>
    </section>
  );
}
