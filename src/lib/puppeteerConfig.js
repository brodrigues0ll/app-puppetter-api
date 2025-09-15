import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function launchBrowser() {
  const isLocal = process.env.VERCEL === undefined;

  return isLocal
    ? await require("puppeteer").launch({
        // desenvolvimento local
        headless: true,
        defaultViewport: null,
        args: ["--start-maximized"],
      })
    : await puppeteer.launch({
        // Vercel
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar"
        ),
        headless: chromium.headless,
      });
}

export async function createPage(browser, cookies = null) {
  const page = await browser.newPage();

  // Bloqueia recursos pesados
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) req.abort();
    else req.continue();
  });

  if (cookies) await page.setCookie(...cookies);
  return page;
}
