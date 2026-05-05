import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await connectDB();
  const dbUser = await User.findById(user.id).select("dailyLimit");
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  return NextResponse.json({ dailyLimit: dbUser.dailyLimit });
}

export async function POST(req) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { dailyLimit } = await req.json();
  if (!dailyLimit || isNaN(Number(dailyLimit)) || Number(dailyLimit) <= 0) {
    return NextResponse.json({ error: "Limite inválido" }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(user.id, { dailyLimit: Number(dailyLimit) });

  return NextResponse.json({ success: true });
}
