import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function launchBrowser() {
  const isLocal = process.env.NETLIFY === undefined;

  if (isLocal) {
    // Desenvolvimento local com Chrome completo do Puppeteer
    const { default: p } = await import("puppeteer");
    return p.launch({
      headless: true,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
  }

  // Ambiente Netlify (usa o binário do chromium-min)
  const executablePath = await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless, // respeita a config recomendada do pacote
  });
}

export async function createPage(browser, cookies = null) {
  const page = await browser.newPage();

  // Bloqueia recursos pesados para acelerar
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  if (cookies) await page.setCookie(...cookies);
  return page;
}
