"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCachedReports, setCachedReports } from "@/lib/db";
import {
  DollarSign,
  Calendar,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getLastDay(year, month) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  return isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();
}

function computeDashboard(reports, dailyLimit, year, month) {
  const lastDay = getLastDay(year, month);
  const limit = Number(dailyLimit);
  let balance = 0; // saldo corrente: soma de (limite - gasto + receita) de cada dia
  const rows = [];

  for (let d = 1; d <= lastDay; d++) {
    const dayStr = `${String(d).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    const report = reports.find((r) => r.date === dayStr);

    balance += limit; // cada dia começa creditando o limite do dia

    if (report) {
      const spent = report.expenses ?? 0;
      const earnings = report.earnings ?? 0;

      balance -= spent;
      balance += earnings;

      let status = "";
      if (spent < limit) {
        status = `| ✅ Sobra R$ ${(limit - spent).toFixed(2)}`;
      } else if (spent > limit) {
        status = `| ⚠️ Estourou R$ ${(spent - limit).toFixed(2)}`;
      } else {
        status = "| 👍 OK";
      }

      rows.push({
        date: dayStr,
        spent: spent.toFixed(2),
        earnings: earnings > 0 ? earnings.toFixed(2) : null,
        status: status.trim(),
        saldoDia: balance.toFixed(2),
      });
    } else {
      // sem dados = não gastou nada, limite do dia fica no saldo
      rows.push({
        date: dayStr,
        spent: "–",
        earnings: null,
        status: "| ✅ Sem gastos",
        saldoDia: balance.toFixed(2),
      });
    }
  }

  return {
    rows,
    available: balance.toFixed(2),
    daysToZero: limit > 0 && balance < 0
      ? Math.ceil(Math.abs(balance) / limit)
      : null,
  };
}

export default function HomePage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [available, setAvailable] = useState(null);
  const [daysToZero, setDaysToZero] = useState(null);
  const [rows, setRows] = useState([]);
  const [dailyLimit, setDailyLimit] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [noCredentials, setNoCredentials] = useState(false);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const loadData = useCallback(async (yr, mo) => {
    setAvailable(null);
    setDaysToZero(null);
    setRows([]);
    setNoCredentials(false);

    const settingsRes = await fetch("/api/user/settings");
    const settings = await settingsRes.json();
    if (!settings.dailyLimit) return;
    const limit = settings.dailyLimit;
    setDailyLimit(limit);

    // Carrega cache imediatamente
    const cached = await getCachedReports(yr, mo);
    if (cached.length > 0) {
      const dash = computeDashboard(cached, limit, yr, mo);
      setRows(dash.rows);
      setAvailable(dash.available);
      setDaysToZero(dash.daysToZero);
    }

    // Sincroniza em background
    setSyncing(true);
    try {
      const res = await fetch(`/api/reports?year=${yr}&month=${mo}`);
      const json = await res.json();

      if (res.status === 400 && json.error?.includes("Credenciais")) {
        setNoCredentials(true);
        return;
      }

      if (!json.data) return;

      const changed = JSON.stringify(json.data) !== JSON.stringify(cached);
      if (changed) {
        await setCachedReports(yr, mo, json.data);
        const dash = computeDashboard(json.data, limit, yr, mo);
        setRows(dash.rows);
        setAvailable(dash.available);
        setDaysToZero(dash.daysToZero);
      }
    } catch {
      // mantém cache
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadData(year, month);
  }, [year, month, loadData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Topbar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-none">
                PocketFlow
              </h1>
              {session?.user?.email && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hidden sm:block">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {syncing && <RefreshCw className="h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin mr-1" />}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Sair"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">
        {/* Aviso sem credenciais */}
        {noCredentials && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Credenciais não configuradas</p>
              <p className="text-sm mt-0.5">
                Configure seu email e token do Organizze em{" "}
                <Link href="/settings" className="underline font-medium">Configurações</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Navegação de mês */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold text-gray-800 dark:text-white w-44 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Card disponível hoje */}
        {isCurrentMonth && (
          <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">
            <CardContent className="relative text-center py-8 sm:py-10 px-4">
              {available !== null ? (
                <>
                  <p className="text-sm text-white/70 font-medium mb-2 flex items-center justify-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Disponível para gastar hoje
                  </p>
                  <p className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                    {Number(available) >= 0 ? "💸" : "🚨"} R$ {available}
                  </p>

                  {daysToZero !== null && (
                    <p className="mt-3 text-sm text-white/80">
                      São necessários{" "}
                      <span className="font-bold text-white">{daysToZero} dias</span>{" "}
                      sem gastar para zerar
                    </p>
                  )}

                  {dailyLimit && (
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-white/60">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">Limite diário: R$ {Number(dailyLimit).toFixed(2)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="h-7 w-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="text-white font-medium">Carregando...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabela resumo */}
        <Card className="border border-gray-200 dark:border-white/10 shadow-xl bg-white dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Resumo — {MONTH_NAMES[month - 1]} {year}
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Dia</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Gasto</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-10">
                        {syncing ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Buscando dados...
                          </div>
                        ) : "Nenhum dado encontrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, idx) => (
                      <TableRow
                        key={idx}
                        className={`border-l-4 transition-colors ${
                          row.status.includes("Sobra")
                            ? "border-l-green-500 bg-green-50/60 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20"
                            : row.status.includes("⚠️")
                            ? "border-l-red-500 bg-red-50/60 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : row.status === "Sem dados"
                            ? "border-l-gray-300 dark:border-l-gray-700 bg-gray-50/60 dark:bg-white/[0.02]"
                            : "border-l-blue-500 dark:border-l-blue-700"
                        }`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 text-sm py-2.5">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-sm py-2.5">
                          {row.spent !== "–" ? (
                            <span className="text-gray-900 dark:text-gray-100">
                              R$ {row.spent}
                              {row.earnings && (
                                <span className="ml-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                                  +{row.earnings}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">–</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm py-2.5">
                          <span className={`font-medium ${
                            row.status.includes("Sobra")
                              ? "text-green-700 dark:text-green-400"
                              : row.status.includes("⚠️")
                              ? "text-red-700 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-500"
                          }`}>
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell className={`font-semibold text-sm py-2.5 ${
                          Number(row.saldoDia) > 0
                            ? "text-green-700 dark:text-green-400"
                            : Number(row.saldoDia) < 0
                            ? "text-red-700 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          R$ {row.saldoDia}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
