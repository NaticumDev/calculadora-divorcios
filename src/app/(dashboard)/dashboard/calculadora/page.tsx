"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import CalculatorWizard from "@/components/calculator/CalculatorWizard";
import { useCalculation } from "@/hooks/useCalculation";

export default function DashboardCalculadoraPage() {
  const reset = useCalculation((s) => s.reset);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calculadora de Divorcio</h1>
        <p className="text-muted-foreground">
          Completa los pasos para obtener un estimado de los costos.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Aviso legal</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Esta herramienta proporciona estimaciones con fines informativos y
          educativos únicamente. Los montos calculados son aproximaciones basadas
          en criterios generales de la práctica judicial en Yucatán y en el
          Código de Familia para el Estado de Yucatán, y no constituyen asesoría
          legal, financiera ni profesional de ningún tipo.
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {[
            "Los resultados son aproximaciones referenciales, no garantías ni compromisos",
            "Ningún resultado sustituye la consulta con un abogado especializado",
            "La información que ingreses se utiliza exclusivamente para generar el cálculo",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <CalculatorWizard isAuthenticated />
    </div>
  );
}
