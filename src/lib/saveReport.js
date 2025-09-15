import Report from "@/models/Report";
import connectDB from "@/lib/mongodb"; // Certifique-se de ter o connectDB

export async function saveReports(data) {
  await connectDB(); // Conecta ao MongoDB

  const saved = [];

  for (const item of data) {
    try {
      // Upsert: cria se não existir, atualiza se já existir
      const report = await Report.findOneAndUpdate(
        { date: item.date },
        { $set: item },
        { upsert: true, new: true }
      );
      saved.push(report);
    } catch (err) {
      console.error(`Erro ao salvar o relatório ${item.date}:`, err.message);
    }
  }

  return saved;
}
