"use server";

export async function login(page, email, password, reportUrl) {
  try {
    console.log("🔑 Iniciando login...");
    const loginUrl = "https://auth.organizze.com.br/login";
    await page.goto(loginUrl);

    console.log("✏️ Preenchendo formulário...");
    await page.fill("#email", email);
    await page.fill("#password", password);

    console.log("📤 Enviando formulário...");
    await page.click('button[type="submit"]');

    console.log("⏳ Aguardando navegação pós-login...");
    await page.waitForNavigation({ waitUntil: "networkidle" });

    console.log("🌐 Acessando relatório...");
    await page.goto(reportUrl);

    console.log("🔘 Marcando checkbox 'predicted'...");
    const checkbox = await page.$("#predicted");
    if (checkbox) {
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
        console.log("✅ Checkbox 'predicted' marcado.");
      } else {
        console.log("✅ Checkbox 'predicted' já estava marcado.");
      }
    } else {
      console.warn("⚠️ Checkbox 'predicted' não encontrado.");
    }

    console.log("📊 Verificando tabela...");
    await page.waitForSelector("table tbody tr", {
      state: "attached",
      timeout: 30000,
    });

    console.log("✅ Login e acesso ao relatório concluídos.");
  } catch (error) {
    console.error("❌ Erro no login:", error);
    throw new Error("Falha ao realizar login ou acessar o relatório.");
  }
}
