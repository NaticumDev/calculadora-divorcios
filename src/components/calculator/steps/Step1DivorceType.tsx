"use client";

import { useCalculation } from "@/hooks/useCalculation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DivorceType } from "@/types/calculation";

const DIVORCE_OPTIONS: {
  type: DivorceType;
  title: string;
  description: string;
  details: string[];
}[] = [
  {
    type: "VOLUNTARIO",
    title: "Divorcio Voluntario",
    description: "Ambas partes están de acuerdo en divorciarse.",
    details: [
      "Proceso más rápido y económico",
      "Requiere convenio firmado por ambas partes",
      "Menor carga emocional y legal",
      "Se presenta ante el Juez de lo Familiar",
    ],
  },
  {
    type: "CONTENCIOSO",
    title: "Divorcio Contencioso",
    description: "No existe acuerdo entre las partes.",
    details: [
      "Proceso más largo y costoso",
      "Una de las partes demanda a la otra",
      "Requiere representación legal individual",
      "El juez determina las condiciones del divorcio",
    ],
  },
];

export default function Step1DivorceType() {
  const { divorceType, setDivorceType } = useCalculation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Tipo de divorcio
        </h2>
        <p className="mt-1 text-muted-foreground">
          Seleccione el tipo de divorcio que corresponde a su situación.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {DIVORCE_OPTIONS.map((option) => {
          const isSelected = divorceType === option.type;
          return (
            <Card
              key={option.type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? "border-2 border-primary ring-1 ring-primary/20"
                  : "hover:border-primary/40"
              }`}
              onClick={() => setDivorceType(option.type)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  {option.description}
                </p>
                <ul className="space-y-1.5">
                  {option.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
