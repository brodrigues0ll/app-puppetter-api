import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

// Cookie/sessão em memória para reaproveitar login
let savedCookies = null;

// Token secreto que sua aplicação envia no header
const SECRET_KEY = process.env.RELATORIO_API_KEY;

export async function GET(req) {
  try {
    // 1️⃣ Verifica se o header correto foi enviado
    // const authHeader = req.headers.get("x-api-key");
    // if (authHeader !== SECRET_KEY) {
    //   return NextResponse.json(
    //     { success: false, error: "Acesso negado" },
    //     { status: 403 }
    //   );
    // }

    const email = process.env.ORGANIZZE_EMAIL;
    const password = process.env.ORGANIZZE_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Credenciais não configuradas no .env" },
        { status: 500 }
      );
    }

    // 2️⃣ Inicializa navegador headless para velocidade
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    // 3️⃣ Bloqueia recursos pesados
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 4️⃣ Reaproveita sessão se houver cookies
    if (savedCookies) {
      await page.setCookie(...savedCookies);
    }

    const loginUrl = "https://auth.organizze.com.br/login";
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

    // 5️⃣ Faz login apenas se não estiver logado
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
    }

    // 6️⃣ Acessa página de relatórios
    const reportUrl =
      "https://app.organizze.com.br/4599414/relatorios/entradas-e-saidas";
    await page.goto(reportUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // 7️⃣ Extrai dados apenas do mês
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
