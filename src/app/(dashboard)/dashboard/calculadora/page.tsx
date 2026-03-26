"use client";

import CalculatorWizard from "@/components/calculator/CalculatorWizard";

export default function DashboardCalculadoraPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calculadora de Divorcio</h1>
        <p className="text-muted-foreground">
          Completa los pasos para obtener un estimado de los costos de tu
          divorcio. Tu cálculo será guardado automáticamente.
        </p>
      </div>
      <CalculatorWizard />
    </div>
  );
}
