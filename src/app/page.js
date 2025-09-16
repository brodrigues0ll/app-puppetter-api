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
      const todayStr = today.toLocaleDateString("pt-BR");
      const currentDay = today.getDate();

      const todayReport = data.find((r) => r.date === todayStr);

      let spentToday = 0;
      if (todayReport) {
        spentToday = parseFloat(
          todayReport.expenses.replace("-", "").replace(",", ".")
        );
      }

      let leftover = 0;
      const rowsData = [];

      // Gerar linhas apenas até o dia atual
      for (let d = 1; d <= currentDay; d++) {
        const dayStr =
          String(d).padStart(2, "0") +
          "/" +
          (today.getMonth() + 1).toString().padStart(2, "0") +
          "/" +
          today.getFullYear();

        const report = data.find((r) => r.date === dayStr);
        if (report) {
          const dailySpent = parseFloat(
            report.expenses.replace("-", "").replace(",", ".")
          );
          let status = "";

          if (dailySpent < 60) {
            const sobra = 60 - dailySpent;
            status = `Sobra R$ ${sobra.toFixed(2)}`;
            leftover += sobra;
          } else if (dailySpent > 60) {
            const excesso = dailySpent - 60;
            status = `⚠️ Estourou R$ ${excesso.toFixed(2)}`;
            leftover -= excesso;
          } else {
            status = "OK";
          }

          rowsData.push({
            date: report.date,
            spent: dailySpent.toFixed(2),
            status,
          });
        } else {
          rowsData.push({
            date: dayStr,
            spent: "–",
            status: "Sem dados",
          });
        }
      }

      const availableNow = parseFloat(savedLimit) - spentToday + leftover;

      setRows(rowsData);
      setAvailable(availableNow.toFixed(2));
    }

    calculate();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Meu Saldo Diário</h1>

      <Card>
        <CardContent className="text-center py-6">
          {available !== null ? (
            <>
              <p className="text-lg">Disponível para gastar hoje</p>
              <p className="text-4xl font-bold text-green-600">
                R$ {available}
              </p>
              {limit && (
                <p className="text-sm text-gray-500">
                  Limite diário configurado: R$ {limit}
                </p>
              )}
            </>
          ) : (
            <p>Carregando...</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-2">Resumo do mês</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dia</TableHead>
              <TableHead>Gasto</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={idx}
                className={
                  row.status.includes("Sobra")
                    ? "bg-green-50"
                    : row.status.includes("⚠️")
                    ? "bg-red-50"
                    : ""
                }
              >
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  {row.spent !== "–" ? `R$ ${row.spent}` : "–"}
                </TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
