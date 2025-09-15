import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

let savedCookies = null; // Para reaproveitar sessão em requisições futuras

export async function GET() {
  try {
    const email = process.env.ORGANIZZE_EMAIL;
    const password = process.env.ORGANIZZE_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Credenciais não configuradas no .env" },
        { status: 500 }
      );
    }

    // 1️⃣ Inicializa o navegador (headless para velocidade)
    const browser = await puppeteer.launch({
      headless: true, // mais rápido
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    // 2️⃣ Bloqueia recursos pesados (imagens, CSS, fonts)
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 3️⃣ Reaproveita sessão se houver cookies salvos
    if (savedCookies) {
      await page.setCookie(...savedCookies);
      console.log("♻️ Sessão reaproveitada com cookies salvos");
    }

    const loginUrl = "https://auth.organizze.com.br/login";
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

    // 4️⃣ Se não tiver sessão válida, faz login
    const loggedIn = await page.evaluate(
      () => !!document.querySelector("nav, .navbar, .app-header")
    );
    if (!loggedIn) {
      await page.waitForSelector("#email", { visible: true });
      await page.type("#email", email, { delay: 20 });
      await page.waitForSelector("#password", { visible: true });
      await page.type("#password", password, { delay: 20 });

      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForSelector("nav, .navbar, .app-header", { timeout: 15000 }),
      ]);

      // Salva cookies para próximas requisições
      savedCookies = await page.cookies();
      console.log("✅ Login realizado e cookies salvos");
    } else {
      console.log("✅ Já estava logado");
    }

    // 5️⃣ Vai para a página de relatórios
    const reportUrl =
      "https://app.organizze.com.br/4599414/relatorios/entradas-e-saidas";
    await page.goto(reportUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // 6️⃣ Extrai dados da tabela apenas do mês (datas válidas)
    const tableData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));
      const regexDate = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY
      return rows
        .map((row) => {
          const cells = row.querySelectorAll("td");
          return {
            date: cells[0]?.innerText.trim() || "",
            earnings: cells[1]?.innerText.trim() || "",
            expenses: cells[2]?.innerText.trim() || "",
            result: cells[3]?.innerText.trim() || "",
            balance: cells[4]?.innerText.trim() || "",
          };
        })
        .filter((item) => regexDate.test(item.date));
    });

    // 7️⃣ Retorna JSON
    return NextResponse.json({
      success: true,
      data: tableData,
    });
  } catch (error) {
    console.error("❌ Erro no Puppeteer:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
