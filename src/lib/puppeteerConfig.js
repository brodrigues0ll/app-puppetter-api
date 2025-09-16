import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function launchBrowser() {
  const isLocal = process.env.NETLIFY === undefined;

  return isLocal
    ? await import("puppeteer").then(({ default: p }) =>
        p.launch({
          // Desenvolvimento local com Chrome do Puppeteer normal
          headless: true,
          defaultViewport: null,
          args: ["--start-maximized"],
        })
      )
    : await puppeteer.launch({
        // Ambiente Netlify
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: null,
        executablePath: chromium.path, // binário do pacote chromium
        headless: true,
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
