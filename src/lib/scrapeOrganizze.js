// src/lib/scrapeOrganizze.js

"use server";

export async function scrapeReport(page) {
  console.log("📊 Extraindo dados da tabela...");

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));

    return rows.map((row) => {
      const date = row.querySelector("td.title")?.innerText.trim() || "";
      const earnings = row.querySelector("td.earnings")?.innerText.trim() || "";
      const expenses = row.querySelector("td.expenses")?.innerText.trim() || "";
      const result = row.querySelector("td.result")?.innerText.trim() || "";
      const balance = row.querySelector("td.balance")?.innerText.trim() || "";

      return { date, earnings, expenses, result, balance };
    });
  });

  console.log(`✅ Extração concluída: ${data.length} registros.`);
  return data;
}
