export default async (req) => {
  const { next_run } = await req.json();

  const update = async () => {
    const res = await fetch(
      "https://app-puppeteer-api.netlify.app/api/reports/update",
      {
        method: "GET",
      }
    );
    const data = await res.json();
    console.log("✅ Relatórios atualizados:", data.length);
  };

  console.log(
    "⏰ Executando a próxima execução de atualização de relatórios..."
  );
  await update();
};
