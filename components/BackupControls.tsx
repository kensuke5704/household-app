"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { downloadBackup, restoreBackup } from "@/lib/backup";

export default function BackupControls({ allowExport = true }: { allowExport?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleExport() {
    try {
      downloadBackup();
      setIsError(false);
      setMessage("バックアップを書き出しました");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "書き出しに失敗しました");
    }
  }

  async function handleRestore(file?: File) {
    if (!file) return;
    try {
      const summary = await restoreBackup(file);
      setIsError(false);
      setMessage(`復元しました（明細 ${summary.transactions}件）`);
      window.setTimeout(() => window.location.reload(), 600);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "復元に失敗しました");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void handleRestore(event.target.files?.[0])}
      />
      <div className={`grid gap-3 ${allowExport ? "grid-cols-2" : "grid-cols-1"}`}>
        {allowExport && (
          <button
            type="button"
            onClick={handleExport}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#d7c7aa] bg-white text-sm font-black text-[#5b4630] active:scale-[0.99]"
          >
            <Download size={17} />
            書き出す
          </button>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#5b4630] text-sm font-black text-white shadow-sm active:scale-[0.99]"
        >
          <Upload size={17} />
          復元する
        </button>
      </div>
      {message && (
        <p className={`rounded-2xl px-3 py-2 text-xs font-bold ${isError ? "bg-[#fff0ed] text-[#b42318]" : "bg-[#eef7ed] text-[#35633a]"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
