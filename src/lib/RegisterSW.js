"use client"; // importante

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registrado:", reg))
          .catch((err) => console.log("Erro ao registrar SW:", err));
      });
    }
  }, []);

  return null;
}
