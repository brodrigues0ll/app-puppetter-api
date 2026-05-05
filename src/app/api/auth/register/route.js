import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email e senha (mín. 6 caracteres) são obrigatórios" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email: email.toLowerCase(), passwordHash });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
