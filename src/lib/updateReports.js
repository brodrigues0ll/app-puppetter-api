import { launchBrowser, createPage } from "@/lib/puppeteerConfig";
import { getSavedCookies, loginIfNeeded } from "@/lib/session";
import { scrapeReport } from "@/lib/scrapeOrganizze";
import { saveReports } from "@/lib/saveReport";

const email = process.env.ORGANIZZE_EMAIL;
const password = process.env.ORGANIZZE_PASSWORD;
const reportUrl =
  "https://app.organizze.com.br/4599414/relatorios/entradas-e-saidas";

export async function updateReports() {
  if (!email || !password) {
    throw new Error("Credenciais não configuradas no .env");
  }

  let browser;
  try {
    browser = await launchBrowser();
    const page = await createPage(browser, getSavedCookies());

    await loginIfNeeded(page, email, password, reportUrl);
    const data = await scrapeReport(page);

    const savedData = await saveReports(data);
    console.log("✅ Relatórios atualizados:", savedData.length);
    return savedData;
  } catch (err) {
    console.error("❌ Erro ao atualizar relatórios:", err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}
