"use client";

import { useState } from "react";
import { useCalculation } from "@/hooks/useCalculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function Step3Income() {
  const {
    obligorMonthlyIncome,
    beneficiaryMonthlyIncome,
    setIncome,
  } = useCalculation();

  const [obligor, setObligor] = useState(obligorMonthlyIncome);
  const [beneficiary, setBeneficiary] = useState(beneficiaryMonthlyIncome);

  const handleObligorChange = (value: number) => {
    const clamped = Math.max(0, value);
    setObligor(clamped);
    setIncome(clamped, beneficiary);
  };

  const handleBeneficiaryChange = (value: number) => {
    const clamped = Math.max(0, value);
    setBeneficiary(clamped);
    setIncome(obligor, clamped);
  };

  const totalIncome = obligor + beneficiary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Ingresos mensuales
        </h2>
        <p className="mt-1 text-muted-foreground">
          Ingrese los ingresos netos mensuales de cada parte.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingresos de las partes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obligor">Ingreso mensual del obligado</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="obligor"
                type="number"
                min={0}
                className="pl-7"
                value={obligor}
                onChange={(e) =>
                  handleObligorChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Persona que paga la pensión alimenticia y/o compensatoria.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary">Ingreso mensual del beneficiario</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="beneficiary"
                type="number"
                min={0}
                className="pl-7"
                value={beneficiary}
                onChange={(e) =>
                  handleBeneficiaryChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Persona que recibe la pensión alimenticia y/o compensatoria.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Ingreso familiar total
            </span>
            <span className="text-lg font-semibold">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          {obligor > 0 && (
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-md bg-primary/10 p-2 text-center">
                <p className="text-xs text-muted-foreground">Obligado</p>
                <p className="text-sm font-medium">
                  {((obligor / totalIncome) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="flex-1 rounded-md bg-secondary p-2 text-center">
                <p className="text-xs text-muted-foreground">Beneficiario</p>
                <p className="text-sm font-medium">
                  {((beneficiary / totalIncome) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        <p className="font-medium">Nota importante</p>
        <p className="mt-1">
          Ingrese los ingresos netos mensuales (después de impuestos y
          deducciones obligatorias). Estos montos se utilizan para calcular las
          pensiones conforme al principio de proporcionalidad del Código de
          Familia de Yucatán.
        </p>
      </div>
    </div>
  );
}
