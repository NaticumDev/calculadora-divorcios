"use client";

import { useState } from "react";
import { useCalculation } from "@/hooks/useCalculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { calculateCompensatory } from "@/lib/calculations/pension-compensatoria";
import type {
  HealthStatus,
  ProfessionalOpps,
  HouseholdContribution,
  EstimateLevel,
} from "@/types/calculation";

const ESTIMATE_LEVELS: {
  key: EstimateLevel;
  label: string;
  description: string;
}[] = [
  {
    key: "conservative",
    label: "Conservador",
    description: "Escenario mínimo probable",
  },
  {
    key: "moderate",
    label: "Moderado",
    description: "Escenario más probable",
  },
  {
    key: "aggressive",
    label: "Agresivo",
    description: "Escenario máximo probable",
  },
];

export default function Step5PensionCompensatoria() {
  const {
    compensatory,
    marriageDurationYears,
    obligorMonthlyIncome,
    beneficiaryMonthlyIncome,
    setCompensatoryEnabled,
    setCompensatoryFactors,
    setEstimateLevel,
  } = useCalculation();

  const [useCustom, setUseCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");

  const factors = {
    marriageDurationYears,
    obligorMonthlyIncome,
    beneficiaryMonthlyIncome,
    beneficiaryAge: compensatory.beneficiaryAge,
    healthStatus: compensatory.healthStatus,
    professionalOppsLost: compensatory.professionalOppsLost,
    householdContribution: compensatory.householdContribution,
  };

  const customValue = useCustom && customAmount ? parseFloat(customAmount) : undefined;
  const result = compensatory.enabled
    ? calculateCompensatory(factors, customValue && customValue > 0 ? customValue : undefined)
    : null;

  const handleCustomToggle = (enabled: boolean) => {
    setUseCustom(enabled);
    if (!enabled) {
      setCustomAmount("");
      setCompensatoryFactors({ customMonthly: undefined });
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value) || 0;
    setCompensatoryFactors({ customMonthly: parsed > 0 ? parsed : undefined });
  };

  const incomeDiff = obligorMonthlyIncome > 0
    ? ((obligorMonthlyIncome - beneficiaryMonthlyIncome) / obligorMonthlyIncome * 100).toFixed(0)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Pensión compensatoria
        </h2>
        <p className="mt-1 text-muted-foreground">
          La pensión compensatoria busca compensar el desequilibrio económico
          causado por el divorcio (Art. 200, Código de Familia de Yucatán).
        </p>
      </div>

      {/* Enable/disable */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="font-medium">Solicitar pensión compensatoria</p>
            <p className="text-sm text-muted-foreground">
              Aplica cuando existe un desequilibrio económico entre las partes.
            </p>
          </div>
          <Switch
            checked={compensatory.enabled}
            onCheckedChange={setCompensatoryEnabled}
          />
        </CardContent>
      </Card>

      {compensatory.enabled && (
        <>
          {/* Income differential info */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">Datos base del cálculo</p>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              <p>Ingreso obligado: <span className="font-semibold">{formatCurrency(obligorMonthlyIncome)}</span></p>
              <p>Ingreso beneficiario: <span className="font-semibold">{formatCurrency(beneficiaryMonthlyIncome)}</span></p>
              <p>Diferencial de ingresos: <span className="font-semibold">{incomeDiff}%</span></p>
              <p>Duración del matrimonio: <span className="font-semibold">{marriageDurationYears} {marriageDurationYears === 1 ? "año" : "años"}</span></p>
            </div>
          </div>

          {/* Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Factores de cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="beneficiaryAge">Edad del beneficiario</Label>
                <Input
                  id="beneficiaryAge"
                  type="number"
                  min={18}
                  max={99}
                  value={compensatory.beneficiaryAge}
                  onChange={(e) =>
                    setCompensatoryFactors({
                      beneficiaryAge: parseInt(e.target.value) || 35,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthStatus">Estado de salud</Label>
                <Select
                  id="healthStatus"
                  value={compensatory.healthStatus}
                  onChange={(e) =>
                    setCompensatoryFactors({
                      healthStatus: e.target.value as HealthStatus,
                    })
                  }
                >
                  <SelectOption value="good">Bueno</SelectOption>
                  <SelectOption value="fair">Regular</SelectOption>
                  <SelectOption value="poor">Malo</SelectOption>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalOpps">
                  Oportunidades profesionales perdidas
                </Label>
                <Select
                  id="professionalOpps"
                  value={compensatory.professionalOppsLost}
                  onChange={(e) =>
                    setCompensatoryFactors({
                      professionalOppsLost: e.target.value as ProfessionalOpps,
                    })
                  }
                >
                  <SelectOption value="none">Ninguna</SelectOption>
                  <SelectOption value="some">Algunas</SelectOption>
                  <SelectOption value="significant">Significativas</SelectOption>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="householdContribution">
                  Contribución al hogar
                </Label>
                <Select
                  id="householdContribution"
                  value={compensatory.householdContribution}
                  onChange={(e) =>
                    setCompensatoryFactors({
                      householdContribution: e.target
                        .value as HouseholdContribution,
                    })
                  }
                >
                  <SelectOption value="partial">Parcial</SelectOption>
                  <SelectOption value="primary">Principal</SelectOption>
                  <SelectOption value="exclusive">Exclusiva</SelectOption>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Estimate levels */}
          {result && !useCustom && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Nivel de estimación
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Seleccione el escenario que desea utilizar para el cálculo.
                </p>
              </CardHeader>
              <CardContent>
                {result.conservative === 0 && result.moderate === 0 && result.aggressive === 0 ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Sin diferencial de ingresos</p>
                    <p className="mt-1">
                      El beneficiario tiene un ingreso igual o mayor al obligado.
                      La pensión compensatoria requiere un desequilibrio económico
                      para generar un monto. Puede usar un monto personalizado abajo.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {ESTIMATE_LEVELS.map((level) => {
                      const isSelected =
                        compensatory.estimateLevel === level.key;
                      const amount = result[level.key];
                      return (
                        <div
                          key={level.key}
                          className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-muted hover:border-primary/40"
                          }`}
                          onClick={() => setEstimateLevel(level.key)}
                        >
                          <p className="text-xs font-medium text-muted-foreground">
                            {level.label}
                          </p>
                          <p className="mt-1 text-xl font-bold">
                            {formatCurrency(amount)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            mensual
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {level.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Custom override */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Monto personalizado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ingrese un monto mensual manual en lugar de usar la estimación.
                  </p>
                </div>
                <Switch
                  checked={useCustom}
                  onCheckedChange={handleCustomToggle}
                />
              </div>

              {useCustom && (
                <div className="space-y-2">
                  <Label htmlFor="customAmount">Monto mensual</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="customAmount"
                      type="number"
                      min={0}
                      className="pl-7"
                      placeholder="Ingrese el monto mensual"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duration and summary */}
          {result && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Resumen de pensión compensatoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duración
                  </span>
                  <span className="font-medium">
                    {result.durationYears}{" "}
                    {result.durationYears === 1 ? "año" : "años"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Monto mensual
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(
                      useCustom && customValue && customValue > 0
                        ? customValue
                        : result[compensatory.estimateLevel]
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium">Total estimado</span>
                  <Badge variant="secondary" className="text-sm">
                    {formatCurrency(
                      (useCustom && customValue && customValue > 0
                        ? customValue
                        : result[compensatory.estimateLevel]) *
                        12 *
                        result.durationYears
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
