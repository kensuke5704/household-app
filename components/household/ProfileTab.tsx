import { Clock3, LogOut, RotateCcw, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import BackupControls from "@/components/BackupControls";
import {
  listAutomaticBackups,
  restoreAutomaticBackup,
  type AutomaticBackupInfo,
} from "@/lib/backup";

export default function ProfileTab() {
  const [activeId, setActiveId] = useState("");
  const [automaticBackups, setAutomaticBackups] = useState<AutomaticBackupInfo[]>([]);
  const [restoreMessage, setRestoreMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setActiveId(window.localStorage.getItem("household.auth.id") || window.localStorage.getItem("household.auth.email") || "");
    const load = () => void listAutomaticBackups().then(setAutomaticBackups).catch(() => setAutomaticBackups([]));
    load();
    window.addEventListener("household-auto-backup", load);
    return () => window.removeEventListener("household-auto-backup", load);
  }, []);

  async function handleAutomaticRestore(id: string) {
    if (!window.confirm("この時点のデータへ戻します。現在のデータは上書きされます。よろしいですか？")) return;
    try {
      const summary = await restoreAutomaticBackup(id);
      setRestoreMessage(`明細 ${summary.transactions}件を復元しました`);
      window.setTimeout(() => window.location.reload(), 600);
    } catch (error) {
      setRestoreMessage(error instanceof Error ? error.message : "復元に失敗しました");
    }
  }

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
          「iCloudへ保存」を押し、共有画面の「ファイルに保存」でiCloud Driveを選んでください。
        </p>
        <BackupControls />
      </div>

      <div className="mb-5 rounded-[22px] border border-[#e6dcc8] p-4">
        <div className="mb-1 flex items-center gap-2 text-[#24190f]">
          <Clock3 size={17} />
          <p className="text-sm font-black">自動バックアップ</p>
        </div>
        <p className="mb-3 text-xs font-bold leading-relaxed text-[#8a7b68]">
          変更時に端末内へ自動保存し、直近10世代を残します。
        </p>
        {automaticBackups.length === 0 ? (
          <p className="rounded-2xl bg-[#f7f3eb] px-3 py-3 text-xs font-bold text-[#8a7b68]">
            最初のバックアップを準備中です
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {automaticBackups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f3eb] px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#24190f]">
                    {new Date(backup.exportedAt).toLocaleString("ja-JP")}
                  </p>
                  <p className="text-[11px] font-bold text-[#8a7b68]">明細 {backup.transactions}件</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleAutomaticRestore(backup.id)}
                  className="flex shrink-0 items-center gap-1 rounded-xl border border-[#d7c7aa] bg-white px-3 py-2 text-xs font-black text-[#5b4630]"
                >
                  <RotateCcw size={14} />
                  戻す
                </button>
              </div>
            ))}
          </div>
        )}
        {restoreMessage && <p className="mt-3 text-xs font-bold text-[#5b4630]">{restoreMessage}</p>}
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
