import { NextResponse } from "next/server";
import { launchBrowser, createPage } from "@/lib/puppeteerConfig";
import { getSavedCookies, loginIfNeeded } from "@/lib/session";
import { scrapeReport } from "@/lib/scrapeOrganizze";

const email = process.env.ORGANIZZE_EMAIL;
const password = process.env.ORGANIZZE_PASSWORD;
const reportUrl =
  "https://app.organizze.com.br/4599414/relatorios/entradas-e-saidas";

export async function GET(req) {
  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Credenciais não configuradas no .env" },
      { status: 500 }
    );
  }

  let browser;
  try {
    browser = await launchBrowser();
    const page = await createPage(browser, getSavedCookies());

    await loginIfNeeded(page, email, password, reportUrl);
    const data = await scrapeReport(page);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("❌ Erro no Puppeteer:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
