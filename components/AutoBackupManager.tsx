"use client";

import { useEffect } from "react";
import { saveAutomaticBackup } from "@/lib/backup";

const ACTIVE_USER_KEY = "household.auth.userKey";

export default function AutoBackupManager() {
  useEffect(() => {
    let timer: number | undefined;

    const save = () => {
      if (!localStorage.getItem(ACTIVE_USER_KEY)) return;
      void saveAutomaticBackup().catch(() => {
        // The app remains usable if private browsing or storage limits block IndexedDB.
      });
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(save, 1500);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save();
    };

    schedule();
    window.addEventListener("storage", schedule);
    window.addEventListener("household-data-changed", schedule);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = window.setInterval(schedule, 60_000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener("storage", schedule);
      window.removeEventListener("household-data-changed", schedule);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
