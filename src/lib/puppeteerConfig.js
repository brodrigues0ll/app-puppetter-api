import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function launchBrowser() {
  const isLocal = process.env.NODE_ENV !== "production";

  if (isLocal) {
    // Ambiente local -> Puppeteer com Chrome embutido
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  // Produção (Netlify, Vercel, AWS Lambda) -> Chromium compactado
  return puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar`
    ),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
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
