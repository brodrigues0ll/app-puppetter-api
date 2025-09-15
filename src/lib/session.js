let savedCookies = null;

export function getSavedCookies() {
  return savedCookies;
}

export function setSavedCookies(cookies) {
  savedCookies = cookies;
}

export async function loginIfNeeded(page, email, password, reportUrl) {
  // Checa se já está logado
  const loggedIn = await page.evaluate(
    () => !!document.querySelector("nav, .navbar, .app-header")
  );

  if (!loggedIn) {
    const loginUrl = "https://auth.organizze.com.br/login";
    await page.goto(loginUrl, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector("#email", { visible: true, timeout: 30000 });
    await page.type("#email", email, { delay: 100 }); // digitação mais lenta

    await page.waitForSelector("#password", { visible: true, timeout: 30000 });
    await page.type("#password", password, { delay: 100 }); // digitação mais lenta

    await page.click('button[type="submit"]');

    // Espera a página carregar completamente após login
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

    // Garante que o seletor de navegação esteja visível
    await page.waitForSelector("nav, .navbar, .app-header", { timeout: 60000 });

    // Salva cookies
    savedCookies = await page.cookies();
  }

  // Vai para o relatório
  await page.goto(reportUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Espera a tabela carregar
  await page.waitForSelector("table tbody tr", { timeout: 60000 });
}
