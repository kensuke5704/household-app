"use client";

import { useEffect, useState } from "react";

export default function PwaRegister() {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const reloadKey = "household-pwa-reloaded-v3";
    let cleanupServiceWorker = () => {};

    if ("serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            `${basePath}/sw.js?v=3`,
            {
              scope: `${basePath}/`,
              updateViaCache: "none",
            },
          );
          await registration.update();
        } catch {
          // PWA registration failed. The app still works normally online.
        }
      };

      const onControllerChange = () => {
        if (sessionStorage.getItem(reloadKey) === "true") return;
        sessionStorage.setItem(reloadKey, "true");
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onControllerChange,
      );

      if (document.readyState === "complete") {
        void registerServiceWorker();
      } else {
        window.addEventListener("load", registerServiceWorker, { once: true });
      }

      cleanupServiceWorker = () => {
        window.removeEventListener("load", registerServiceWorker);
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          onControllerChange,
        );
      };
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      localStorage.setItem("household-pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      cleanupServiceWorker();
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  }

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={install}
      className="fixed bottom-4 right-4 z-[9999] rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-700"
    >
      ホーム画面に追加
    </button>
  );
}
