import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { encrypt } from "@/lib/crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await connectDB();
  const dbUser = await User.findById(user.id).select("organizzeEmail organizzeToken");
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  return NextResponse.json({
    organizzeEmail: dbUser.organizzeEmail,
    hasToken: !!dbUser.organizzeToken,
  });
}

export async function POST(req) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { organizzeEmail, organizzeToken } = await req.json();
  if (!organizzeEmail || !organizzeToken) {
    return NextResponse.json({ error: "Email e token são obrigatórios" }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(user.id, {
    organizzeEmail: organizzeEmail.trim(),
    organizzeToken: encrypt(organizzeToken.trim()),
  });

  return NextResponse.json({ success: true });
}
