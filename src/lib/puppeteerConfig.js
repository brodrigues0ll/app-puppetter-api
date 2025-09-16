import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function launchBrowser() {
  const isLocal = process.env.NODE_ENV !== "production";

  if (isLocal) {
    return puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-dev-shm-usage",
        "--disable-infobars",
        "--single-process",
        "--no-zygote",
      ],
      defaultViewport: null,
      timeout: 30000, // 30s para abrir o browser
    });
  }

  return puppeteerCore.launch({
    args: [...chromium.args, "--disable-gpu", "--disable-dev-shm-usage"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar"
    ),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    timeout: 30000, // 30s para abrir o browser
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

  // Timeout padrão menor para ações e navegação
  await page.setDefaultNavigationTimeout(15000); // 15s
  await page.setDefaultTimeout(10000); // 10s para waitFor

  if (cookies) await page.setCookie(...cookies);

  return page;
}
