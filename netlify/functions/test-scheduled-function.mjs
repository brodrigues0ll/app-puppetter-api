export default async () => {
  const update = async () => {
    try {
      const res = await fetch(
        "https://app-puppeteer-api.netlify.app/api/reports/update",
        { method: "GET" }
      );

      // Verifica se a requisição retornou status 2xx
      if (!res.ok) {
        console.error("❌ Erro na requisição:", res.status, res.statusText);
        return;
      }

      // Lê o corpo como texto primeiro
      const text = await res.text();

      // Tenta parsear como JSON se houver conteúdo
      let data;
      try {
        data = text ? JSON.parse(text) : [];
      } catch (parseError) {
        console.error(
          "❌ Falha ao converter resposta para JSON:",
          parseError,
          "Resposta bruta:",
          text
        );
        data = [];
      }

      console.log(
        "✅ Relatórios atualizados:",
        Array.isArray(data) ? data.length : data
      );
    } catch (err) {
      console.error("❌ Falha ao atualizar relatórios:", err);
    }
  };

  console.log("⏰ Executando atualização de relatórios agendada...");
  await update();
};
