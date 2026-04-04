"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CalculatorWizard from "@/components/calculator/CalculatorWizard";
import { useCalculation } from "@/hooks/useCalculation";

export default function CalculadoraPublicPage() {
  const router = useRouter();
  const reset = useCalculation((s) => s.reset);
  const [status, setStatus] = useState<
    "loading" | "ready" | "no-disclaimer" | "limit-reached"
  >("loading");

  useEffect(() => {
    // Reset wizard to step 1 every time the page loads
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check disclaimer acceptance
    const accepted = localStorage.getItem("disclaimerAccepted");
    if (!accepted) {
      setStatus("no-disclaimer");
      return;
    }

    // Check calculation limit
    fetch("/api/calculations/count")
      .then((r) => r.json())
      .then((data) => {
        if (data.limitReached) {
          setStatus("limit-reached");
        } else {
          setStatus("ready");
        }
      })
      .catch(() => {
        // If API fails, allow usage
        setStatus("ready");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "no-disclaimer") {
    router.push("/");
    return null;
  }

  if (status === "limit-reached") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="mx-auto max-w-md border-amber-200 bg-amber-50">
          <CardContent className="pt-6 pb-5 space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-amber-500" />
            <h2 className="text-xl font-bold text-amber-800">
              La prueba piloto ha concluido
            </h2>
            <p className="text-sm text-amber-700">
              Hemos alcanzado el límite de cálculos para esta etapa de prueba.
              Agradecemos tu interés. Estamos trabajando en la versión final.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-2">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Calculator */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <CalculatorWizard />
      </main>
    </div>
  );
}
