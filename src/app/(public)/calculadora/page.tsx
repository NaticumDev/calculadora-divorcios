"use client";

import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CalculatorWizard from "@/components/calculator/CalculatorWizard";

export default function CalculadoraPublicPage() {
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
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar sesión
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
