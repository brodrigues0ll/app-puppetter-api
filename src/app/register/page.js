"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao criar conta.");
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-2xl">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">PocketFlow</h1>
            <p className="text-gray-400 text-sm mt-1">Crie sua conta e comece a controlar</p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white text-center">Criar conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" /> Senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar senha
                </label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400 h-11"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-semibold shadow-lg transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Criar conta
                  </div>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Já tem conta?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
