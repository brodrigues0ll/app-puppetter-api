// src/lib/playwrightConfig.js
"use server";

import { chromium as playwrightChromium } from "playwright"; // para local
import chromium from "@sparticuz/chromium"; // para produção

export async function launchBrowser() {
  const isLocal = false;

  console.log("🚀 Iniciando o navegador...");

  if (isLocal) {
    // Ambiente local -> Playwright completo
    return playwrightChromium.launch({
      headless: false, // depuração local
      slowMo: 300,
    });
  } else {
    // Ambiente produção -> Playwright-core + Sparticuz Chromium
    const { chromium: playwrightCore } = await import("playwright-core");

    return playwrightCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });
  }
}

export async function createPage(browser, cookies = null) {
  console.log("🌐 Criando contexto e página...");
  const context = await browser.newContext();
  const page = await context.newPage();

  // Bloqueia recursos pesados
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
