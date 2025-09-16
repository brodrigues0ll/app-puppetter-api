"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setSetting, getSetting } from "@/lib/db";
import { Settings, DollarSign, Save, ArrowLeft, Target } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [limit, setLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadLimit() {
      const saved = await getSetting("dailyLimit");
      if (saved) setLimit(saved);
    }
    loadLimit();
  }, []);

  async function handleSave() {
    setIsLoading(true);
    await setSetting("dailyLimit", limit);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg sm:rounded-xl">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Ajuste suas preferências
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        <Card className="border-0 shadow-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-white">
                  Limite Diário
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Defina quanto você pode gastar por dia
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <label className="block">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valor em Reais (R$)
                  </span>
                </div>
                <Input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="Ex: 50.00"
                  className="text-base sm:text-lg py-3 px-4 border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors min-h-[48px]"
                />
              </label>

              {limit && (
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-blue-800 dark:text-blue-200 font-medium">
                      Limite atual: R$ {limit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading || !limit}
              className={`w-full py-3 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-200 min-h-[48px] ${
                isSaved
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isSaved ? (
                  <>
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                    Salvar Configurações
                  </>
                )}
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 rounded-lg flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 text-sm sm:text-base">
                  Dica para um melhor controle
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
                  Defina um limite realista baseado na sua renda mensal.
                  Lembre-se: é melhor começar com um valor menor e ajustar
                  conforme necessário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
