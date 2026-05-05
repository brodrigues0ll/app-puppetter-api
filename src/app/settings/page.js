"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  DollarSign,
  Save,
  ArrowLeft,
  Target,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Download,
} from "lucide-react";
import Link from "next/link";

function SaveButton({ loading, saved, disabled, onClick, label = "Salvar" }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full h-11 font-semibold transition-all ${
        saved
          ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
      }`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Salvando...
        </div>
      ) : saved ? (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Salvo!
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Save className="h-4 w-4" /> {label}
        </div>
      )}
    </Button>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();

  const [limit, setLimit] = useState("");
  const [limitLoading, setLimitLoading] = useState(false);
  const [limitSaved, setLimitSaved] = useState(false);

  const [orgEmail, setOrgEmail] = useState("");
  const [orgToken, setOrgToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credSaved, setCredSaved] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);

  useEffect(() => {
    async function load() {
      const [settingsRes, credRes] = await Promise.all([
        fetch("/api/user/settings"),
        fetch("/api/user/credentials"),
      ]);
      const settings = await settingsRes.json();
      const creds = await credRes.json();

      if (settings.dailyLimit) setLimit(String(settings.dailyLimit));
      if (creds.organizzeEmail) setOrgEmail(creds.organizzeEmail);
      setHasToken(!!creds.hasToken);
    }
    load();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function saveLimit() {
    setLimitLoading(true);
    await fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyLimit: limit }),
    });
    setLimitLoading(false);
    setLimitSaved(true);
    setTimeout(() => setLimitSaved(false), 2500);
  }

  async function saveCredentials() {
    setCredLoading(true);
    const res = await fetch("/api/user/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizzeEmail: orgEmail, organizzeToken: orgToken }),
    });
    setCredLoading(false);
    if (res.ok) {
      setCredSaved(true);
      setHasToken(true);
      setOrgToken("");
      setTimeout(() => setCredSaved(false), 2500);
    }
  }

  async function handleInstallPwa() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsPwaInstallable(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Topbar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
        <div className="px-4 py-3 sm:py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Configurações</h1>
            {session?.user?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-xl mx-auto">
        {/* Credenciais Organizze */}
        <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Conta Organizze
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {hasToken ? "✅ Token configurado" : "Configure para sincronizar seus dados"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email do Organizze
              </label>
              <Input
                type="email"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> API Token
              </label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={orgToken}
                  onChange={(e) => setOrgToken(e.target.value)}
                  placeholder={hasToken ? "••••••••• (deixe em branco para manter)" : "Cole seu token aqui"}
                  className="h-11 pr-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Gere seu token em{" "}
                <span className="text-blue-500 dark:text-blue-400">
                  app.organizze.com.br → Configurações → API
                </span>
              </p>
            </div>
            <SaveButton
              loading={credLoading}
              saved={credSaved}
              disabled={!orgEmail || (!orgToken && !hasToken)}
              onClick={saveCredentials}
              label="Salvar credenciais"
            />
          </CardContent>
        </Card>

        {/* Limite diário */}
        <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Limite Diário</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Quanto você pode gastar por dia
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Valor em Reais (R$)
              </label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Ex: 60.00"
                min="0"
                step="0.01"
                className="h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            {limit && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                  Limite: R$ {Number(limit).toFixed(2)} por dia
                </p>
              </div>
            )}
            <SaveButton
              loading={limitLoading}
              saved={limitSaved}
              disabled={!limit}
              onClick={saveLimit}
              label="Salvar limite"
            />
          </CardContent>
        </Card>

        {/* Instalar PWA */}
        {isPwaInstallable && (
          <Card className="border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                    Instalar aplicativo
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Acesso rápido e offline</p>
                </div>
              </div>
              <Button
                onClick={handleInstallPwa}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
              >
                Instalar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
