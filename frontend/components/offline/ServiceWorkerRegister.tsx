"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[LearnLite] ServiceWorker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("[LearnLite] ServiceWorker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}

