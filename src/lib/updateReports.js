// src/lib/updateReports.js

import { launchBrowser, createPage } from "@/lib/playwrightConfig";
import { login } from "@/lib/session";
import { scrapeReport } from "@/lib/scrapeOrganizze";
import { saveReports } from "@/lib/saveReport";

const email = process.env.ORGANIZZE_EMAIL;
const password = process.env.ORGANIZZE_PASSWORD;
const reportUrl = process.env.REPORT_URL;

export async function updateReports() {
  if (!email || !password || !reportUrl) {
    throw new Error("Credenciais ou URL do relatório não configuradas no .env");
  }

  let browser;
  try {
    console.log("🚀 Atualizando relatórios...");
    browser = await launchBrowser();

    const page = await createPage(browser);
    console.log("🌐 Página criada.");

    // Login e acesso ao relatório
    await login(page, email, password, reportUrl);

    // Extração dos dados
    const data = await scrapeReport(page);

    // Salvando no banco
    const savedData = await saveReports(data);
    console.log(`✅ ${savedData.length} registros salvos.`);

    return savedData;
  } catch (err) {
    console.error("❌ Erro ao atualizar relatórios:", err);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
      console.log("🛑 Navegador fechado.");
    }
  }
}
