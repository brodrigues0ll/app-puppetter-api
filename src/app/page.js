"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSetting } from "@/lib/db";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [available, setAvailable] = useState(null);
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(null);

  useEffect(() => {
    async function calculate() {
      const savedLimit = await getSetting("dailyLimit");
      if (!savedLimit) return;
      setLimit(savedLimit);

      const res = await fetch("/api/reports");
      const { data } = await res.json();

      const today = new Date();
      const currentDay = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      let acumulado = 0; // saldo acumulado de dias anteriores
      const rowsData = [];

      for (let d = 1; d <= currentDay; d++) {
        const dayStr = `${String(d).padStart(2, "0")}/${String(month).padStart(
          2,
          "0"
        )}/${year}`;

        const report = data.find((r) => r.date === dayStr);

        if (report) {
          const dailySpent = Number.parseFloat(
            report.expenses.replace("-", "").replace(",", ".")
          );
          let status = "";
          const saldoDia =
            Number.parseFloat(savedLimit) + acumulado - dailySpent;

          if (dailySpent < Number.parseFloat(savedLimit)) {
            const sobra = Number.parseFloat(savedLimit) - dailySpent;
            status = `Sobra R$ ${sobra.toFixed(2)}`;
            acumulado += sobra;
          } else if (dailySpent > Number.parseFloat(savedLimit)) {
            const excesso = dailySpent - Number.parseFloat(savedLimit);
            status = `⚠️ Estourou R$ ${excesso.toFixed(2)}`;
            acumulado -= excesso;
          } else {
            status = "OK";
          }

          rowsData.push({
            date: report.date,
            spent: dailySpent.toFixed(2),
            status,
            saldoDia: saldoDia.toFixed(2),
          });
        } else {
          rowsData.push({
            date: dayStr,
            spent: "–",
            status: "Sem dados",
            saldoDia: "-",
          });
        }
      }

      const availableToday = Number.parseFloat(savedLimit) + acumulado;

      setRows(rowsData);
      setAvailable(availableToday.toFixed(2));
    }

    calculate();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg sm:rounded-xl">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Controle de Gastos
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Gerencie seus gastos diários
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="p-2 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 backdrop-blur-sm"></div>
          <CardContent className="relative text-center py-8 sm:py-12 px-4 sm:px-8">
            {available !== null ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />
                  <p className="text-base sm:text-xl text-white/90 font-medium">
                    Disponível para gastar hoje
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight break-all">
                    R$ {available}
                  </p>
                  {limit && (
                    <div className="flex items-center justify-center gap-2 text-white/70">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <p className="text-sm sm:text-lg">
                        Limite diário: R$ {limit}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3 bg-blue-800/80 rounded-lg p-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                <p className="text-white font-medium text-base sm:text-lg">
                  Carregando...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Resumo do mês
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 -mx-2 sm:mx-0">
              <div className="min-w-[600px] sm:min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableHead className="font-semibold text-gray-900 dark:text-white py-3 sm:py-4 text-sm sm:text-base">
                        Dia
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white py-3 sm:py-4 text-sm sm:text-base">
                        Gasto
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white py-3 sm:py-4 text-sm sm:text-base">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white py-3 sm:py-4 text-sm sm:text-base">
                        Saldo
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow
                        key={idx}
                        className={`
                          transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30
                          ${
                            row.status.includes("Sobra")
                              ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500"
                              : row.status.includes("⚠️")
                              ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500"
                              : row.status === "Sem dados"
                              ? "bg-gray-50 dark:bg-gray-800/20 border-l-4 border-l-gray-300 dark:border-l-gray-600"
                              : "border-l-4 border-l-blue-500"
                          }
                        `}
                      >
                        <TableCell className="font-medium py-3 sm:py-4 text-gray-900 dark:text-white text-sm sm:text-base">
                          {row.date}
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {row.spent !== "–" && (
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {row.spent !== "–" ? `R$ ${row.spent}` : "–"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {row.status.includes("Sobra") && (
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            )}
                            {row.status.includes("⚠️") && (
                              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                            )}
                            <span
                              className={`font-medium text-xs sm:text-sm ${
                                row.status.includes("Sobra")
                                  ? "text-green-700 dark:text-green-400"
                                  : row.status.includes("⚠️")
                                  ? "text-red-700 dark:text-red-400"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {row.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <span
                            className={`font-semibold text-sm sm:text-base ${
                              Number.parseFloat(row.saldoDia) > 0
                                ? "text-green-700 dark:text-green-400"
                                : Number.parseFloat(row.saldoDia) < 0
                                ? "text-red-700 dark:text-red-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {row.saldoDia !== "-" ? `R$ ${row.saldoDia}` : "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
