import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { fetchTransactions } from "@/lib/organizzeApi";

export async function GET(req) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findById(user.id).select("organizzeEmail organizzeToken");

    if (!dbUser?.organizzeEmail || !dbUser?.organizzeToken) {
      return NextResponse.json(
        { error: "Credenciais do Organizze não configuradas" },
        { status: 400 }
      );
    }

    const organizzeToken = decrypt(dbUser.organizzeToken);

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = Number(searchParams.get("year") ?? now.getFullYear());
    const month = Number(searchParams.get("month") ?? now.getMonth() + 1);

    const mm = String(month).padStart(2, "0");
    const startDate = `${year}-${mm}-01`;
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const lastDay = isCurrentMonth
      ? String(now.getDate()).padStart(2, "0")
      : String(new Date(year, month, 0).getDate()).padStart(2, "0");
    const endDate = `${year}-${mm}-${lastDay}`;

    const transactions = await fetchTransactions(startDate, endDate, dbUser.organizzeEmail, organizzeToken);

    const dailyMap = {};
    for (const tx of transactions) {
      if (tx.oposite_transaction_id != null) continue; // transferência entre contas
      if (tx.paid_credit_card_id != null) continue;   // pagamento de fatura do cartão
      const txDate = tx.date;
      const cents = tx.amount_cents || 0;
      if (!dailyMap[txDate]) dailyMap[txDate] = { earnings: 0, expenses: 0 };
      if (cents > 0) dailyMap[txDate].earnings += cents;
      else dailyMap[txDate].expenses += Math.abs(cents);
    }

    const data = Object.entries(dailyMap).map(([isoDate, agg]) => {
      const [y, m, d] = isoDate.split("-");
      return { date: `${d}/${m}/${y}`, earnings: agg.earnings / 100, expenses: agg.expenses / 100 };
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[/api/reports]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
