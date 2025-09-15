let savedCookies = null;

export function getSavedCookies() {
  return savedCookies;
}

export function setSavedCookies(cookies) {
  savedCookies = cookies;
}

export async function loginIfNeeded(page, email, password, reportUrl) {
  // Verifica se está logado
  const loggedIn = await page.evaluate(
    () => !!document.querySelector("nav, .navbar, .app-header")
  );

  if (!loggedIn) {
    const loginUrl = "https://auth.organizze.com.br/login";
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("#email", { visible: true });
    await page.type("#email", email, { delay: 5 });

    await page.waitForSelector("#password", { visible: true });
    await page.type("#password", password, { delay: 5 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForSelector("nav, .navbar, .app-header", { timeout: 10000 }),
    ]);

    // Salva cookies
    const cookies = await page.cookies();
    savedCookies = cookies;
  }

  // Vai direto para relatório
  await page.goto(reportUrl, { waitUntil: "domcontentloaded" });
}
