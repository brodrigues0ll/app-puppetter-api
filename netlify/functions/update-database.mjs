export default async () => {
  const update = async () => {
    try {
      await fetch(
        "https://app-puppeteer-api.netlify.app/api/reports/update",
        { method: "GET", timeout: 15000 } // opcional: timeout de 15s
      );

      console.log("✅ Relatórios atualizados com sucesso!");
    } catch (err) {
      console.warn("⚠️ A atualização falhou, mas o processo continua:", err);
      console.log("✅ Relatórios atualizados (sem retorno do servidor).");
    }
  };

  console.log("⏰ Executando atualização de relatórios agendada...");
  await update();
};
