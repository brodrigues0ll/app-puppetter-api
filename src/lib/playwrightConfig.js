// src/lib/playwrightConfig.js
"use server";

import { chromium as playwrightChromium } from "playwright"; // para local
import chromium from "@sparticuz/chromium"; // para produção

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

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
      args: [
        ...chromium.args,
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      ignoreDefaultArgs: ["--enable-automation"], // remove flag que denuncia automação
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
      timeout: 30000,
    });
  }
}

export async function createPage(browser, cookies = null) {
  console.log("🌐 Criando contexto e página...");

  const context = await browser.newContext({
    userAgent: DEFAULT_USER_AGENT,
    locale: "pt-BR",
    viewport: { width: 1280, height: 800 },
  });

  // Injeção de script para mascarar propriedades suspeitas
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "languages", {
      get: () => ["pt-BR", "pt", "en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [{ name: "Chrome PDF Plugin" }, { name: "Chrome PDF Viewer" }],
    });

    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: "denied" })
        : originalQuery(parameters);

    window.chrome = window.chrome || { runtime: {}, app: {} };

    try {
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return "Intel Inc.";
        if (parameter === 37446) return "Intel Iris OpenGL Engine";
        return getParameter.call(this, parameter);
      };
    } catch (e) {
      // ignora se não houver WebGL
    }
  });

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

  // pequena espera para simular comportamento humano
  await page.waitForTimeout(300 + Math.floor(Math.random() * 400));

  return page;
}
