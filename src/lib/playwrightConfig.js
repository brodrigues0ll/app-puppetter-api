// src/lib/playwrightConfig.js

import { chromium } from "playwright";

export async function launchBrowser() {
  const isLocal = process.env.NODE_ENV !== "production";

  console.log("🚀 Iniciando o navegador...");
  return chromium.launch({
    headless: false, // Modo headful para depuração
    slowMo: 300, // Adiciona atraso para facilitar a visualização
    args: isLocal
      ? []
      : [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
  });
}

export async function createPage(browser, cookies = null) {
  console.log("🌐 Criando contexto e página...");
  const context = await browser.newContext();
  const page = await context.newPage();

  // Bloqueia recursos pesados para acelerar
  console.log("🔍 Configurando bloqueio de recursos...");
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Adiciona cookies, se disponíveis
  if (cookies) {
    console.log("🍪 Adicionando cookies salvos...");
    await context.addCookies(cookies);
  }

  return page;
}
