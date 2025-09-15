import puppeteer from "puppeteer";

export async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-gpu",
      "--disable-infobars",
      "--single-process",
      "--no-zygote",
    ],
  });
}

export async function createPage(browser, cookies = null) {
  const page = await browser.newPage();

  // Bloqueia recursos pesados
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // Cookies
  if (cookies) await page.setCookie(...cookies);

  return page;
}
