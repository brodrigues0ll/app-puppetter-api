import Report from "@/models/Report";
import connectDB from "@/lib/mongodb";

export async function saveReports(data) {
  await connectDB(); // Conecta ao MongoDB

  const saved = [];

  for (const item of data) {
    try {
      const report = await Report.findOneAndUpdate(
        { date: item.date }, // filtro
        { $set: { ...item, updatedAt: Date.now() } }, // atualiza ou cria
        { upsert: true, new: true } // opções: cria se não existir, retorna o documento atualizado
      );
      saved.push(report);
    } catch (err) {
      console.error(`Erro ao salvar o relatório ${item.date}:`, err.message);
    }
  }

  return saved;
}
