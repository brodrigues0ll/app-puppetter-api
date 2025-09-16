"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setSetting, getSetting } from "@/lib/db";

export default function SettingsPage() {
  const [limit, setLimit] = useState("");

  useEffect(() => {
    async function loadLimit() {
      const saved = await getSetting("dailyLimit");
      if (saved) setLimit(saved);
    }
    loadLimit();
  }, []);

  async function handleSave() {
    await setSetting("dailyLimit", limit);
    alert("Limite diário salvo!");
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <label className="block">
        <span className="text-sm">Limite diário de gastos (R$)</span>
        <Input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="mt-1"
        />
      </label>
      <Button onClick={handleSave}>Salvar</Button>
    </div>
  );
}
