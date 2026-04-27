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
  LifeStandardItems,
} from "@/types/calculation";

const ESTIMATE_LEVELS: {
  key: EstimateLevel;
  label: string;
  description: string;
}[] = [
  { key: "conservative", label: "Conservador", description: "Escenario mínimo probable" },
  { key: "moderate", label: "Moderado", description: "Escenario más probable" },
  { key: "aggressive", label: "Agresivo", description: "Escenario máximo probable" },
];

interface RubroDef {
  key: keyof LifeStandardItems;
  label: string;
  description: string;
}

/**
 * Definición de los rubros del cálculo por nivel de vida.
 * Las descripciones provienen del documento metodológico del despacho
 * y deben mostrarse al cliente como guía de qué incluir.
 */
const RUBROS: RubroDef[] = [
  {
    key: "housing",
    label: "Techo / Vivienda",
    description:
      "Renta de una casa similar a la que habita el día de hoy (si se va a pedir que se salga de la casa donde vive).",
  },
  {
    key: "householdServices",
    label: "Servicios del hogar",
    description:
      "Electricidad, agua, gas butano, telefonía fija y celular, internet, Netflix u otros servicios de streaming, seguridad si se paga actualmente.",
  },
  {
    key: "domesticServices",
    label: "Servicios domésticos",
    description:
      "Personal doméstico si lo acostumbran, gastos de jardinería y mantenimiento de piscina.",
  },
  {
    key: "food",
    label: "Alimentación",
    description:
      "Cantidad semanal o quincenal por compra de comida (carne, frutas, leche, pan, verduras, mantequilla, etc., lo que normalmente consuman). Convertir a monto mensual.",
  },
  {
    key: "hygieneSupplies",
    label: "Limpieza e higiene personal",
    description:
      "Insumos de limpieza e higiene personal (lo que normalmente se compra en el supermercado, además de los víveres).",
  },
  {
    key: "clothing",
    label: "Ropa y calzado",
    description:
      "Sacar un promedio de lo que gastan en ropa y calzado en el año y dividirlo entre 12 meses.",
  },
  {
    key: "personalCare",
    label: "Cuidado personal",
    description:
      "Corte de pelo, cuidado de pies y manos, etc.",
  },
  {
    key: "transport",
    label: "Transporte",
    description:
      "Gasolina semanal, pago de seguro del vehículo, mantenimiento y reparación del vehículo.",
  },
  {
    key: "medical",
    label: "Gastos médicos",
    description:
      "Pago de póliza de gastos médicos mayores, además de compra de medicamentos y consultas que no cubra el seguro médico.",
  },
  {
    key: "recreation",
    label: "Esparcimiento",
    description:
      "Promedio mensual. Si la beneficiaria acostumbraba viajar en vacaciones, considerar la cantidad anual prorrateada (anual / 12).",
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
    setCompensatoryMode,
    setLifeStandardItem,
    setLifeStandardNotes,
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

  const customValue =
    useCustom && customAmount ? parseFloat(customAmount) : undefined;

  // Vista en vivo del modo rápido
  const quickResult =
    compensatory.enabled && compensatory.mode === "QUICK"
      ? calculateCompensatory(
          factors,
          customValue && customValue > 0 ? customValue : undefined
        )
      : null;

  // Cálculo del modo nivel de vida (solo para vista en vivo)
  const lifeStandardTotal = Object.values(
    compensatory.lifeStandardItems
  ).reduce((sum, it) => sum + (Number(it.monthlyAmount) || 0), 0);

  const liquidPension = Object.values(compensatory.lifeStandardItems)
    .filter((it) => !it.paidByObligor)
    .reduce((sum, it) => sum + (Number(it.monthlyAmount) || 0), 0);

  const obligorPaysDirectly = lifeStandardTotal - liquidPension;
  const exceedsIncome =
    obligorMonthlyIncome > 0 && liquidPension > obligorMonthlyIncome;

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
    setCompensatoryFactors({
      customMonthly: parsed > 0 ? parsed : undefined,
    });
  };

  const incomeDiff =
    obligorMonthlyIncome > 0
      ? (
          ((obligorMonthlyIncome - beneficiaryMonthlyIncome) /
            obligorMonthlyIncome) *
          100
        ).toFixed(0)
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
          {/* Selector de modo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Modo de cálculo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Elige cómo se calculará la pensión.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => setCompensatoryMode("QUICK")}
                  className={`text-left rounded-lg border-2 p-4 transition-all ${
                    compensatory.mode === "QUICK"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-muted hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-sm">Estimación rápida</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Basada en factores ponderados (edad, salud, contribución al
                    hogar, diferencial de ingresos). Útil para un primer estimado.
                  </p>
                </button>
                <button
                  onClick={() => setCompensatoryMode("LIFE_STANDARD")}
                  className={`text-left rounded-lg border-2 p-4 transition-all ${
                    compensatory.mode === "LIFE_STANDARD"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-muted hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-sm">
                    Cálculo por nivel de vida
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suma del gasto mensual real para mantener el mismo nivel de
                    vida que tenía la beneficiaria durante el matrimonio.
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Datos base (visibles en ambos modos) */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">Datos base del cálculo</p>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              <p>
                Ingreso obligado:{" "}
                <span className="font-semibold">
                  {formatCurrency(obligorMonthlyIncome)}
                </span>
              </p>
              <p>
                Ingreso beneficiario:{" "}
                <span className="font-semibold">
                  {formatCurrency(beneficiaryMonthlyIncome)}
                </span>
              </p>
              <p>
                Diferencial de ingresos:{" "}
                <span className="font-semibold">{incomeDiff}%</span>
              </p>
              <p>
                Duración del matrimonio:{" "}
                <span className="font-semibold">
                  {marriageDurationYears}{" "}
                  {marriageDurationYears === 1 ? "año" : "años"}
                </span>
              </p>
            </div>
          </div>

          {/* ==================== MODO QUICK ==================== */}
          {compensatory.mode === "QUICK" && (
            <>
              {/* Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Factores de cálculo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="beneficiaryAge">
                      Edad del beneficiario
                    </Label>
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
                          professionalOppsLost: e.target
                            .value as ProfessionalOpps,
                        })
                      }
                    >
                      <SelectOption value="none">Ninguna</SelectOption>
                      <SelectOption value="some">Algunas</SelectOption>
                      <SelectOption value="significant">
                        Significativas
                      </SelectOption>
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
              {quickResult && !useCustom && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Nivel de estimación
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Selecciona el escenario que deseas utilizar.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {quickResult.conservative === 0 &&
                    quickResult.moderate === 0 &&
                    quickResult.aggressive === 0 ? (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <p className="font-medium">
                          Sin diferencial de ingresos
                        </p>
                        <p className="mt-1">
                          El beneficiario tiene un ingreso igual o mayor al
                          obligado. Puedes usar un monto personalizado o cambiar al
                          modo &quot;Cálculo por nivel de vida&quot;.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {ESTIMATE_LEVELS.map((level) => {
                          const isSelected =
                            compensatory.estimateLevel === level.key;
                          const amount = quickResult[level.key];
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
                      <p className="text-sm font-medium">Monto personalizado</p>
                      <p className="text-xs text-muted-foreground">
                        Ingresa un monto mensual manual en lugar de la estimación.
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
                          placeholder="Monto mensual"
                          value={customAmount}
                          onChange={(e) =>
                            handleCustomAmountChange(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen rápido */}
              {quickResult && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Resumen de pensión compensatoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Duración
                      </span>
                      <span className="font-medium">
                        {quickResult.durationYears}{" "}
                        {quickResult.durationYears === 1 ? "año" : "años"}
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
                            : quickResult[compensatory.estimateLevel]
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm font-medium">
                        Total estimado
                      </span>
                      <Badge variant="secondary" className="text-sm">
                        {formatCurrency(
                          (useCustom && customValue && customValue > 0
                            ? customValue
                            : quickResult[compensatory.estimateLevel]) *
                            12 *
                            quickResult.durationYears
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ==================== MODO LIFE_STANDARD ==================== */}
          {compensatory.mode === "LIFE_STANDARD" && (
            <>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-medium">
                  Metodología: nivel de vida durante el matrimonio
                </p>
                <p className="mt-1">
                  La pensión compensatoria debe cubrir el mismo nivel de vida
                  que la beneficiaria ha tenido hasta el momento del divorcio,
                  siempre que el obligado tenga los recursos suficientes. Si los
                  ingresos del obligado disminuyeron, debe ser comprobable
                  documentalmente (declaraciones SAT, etc.).
                </p>
                <p className="mt-2">
                  Captura el monto mensual de cada rubro. Si algún rubro lo
                  pagará directamente el obligado (con acuerdo de la
                  beneficiaria), márcalo y se descontará del monto líquido.
                </p>
              </div>

              {/* Rubros */}
              {RUBROS.map((rubro) => {
                const item = compensatory.lifeStandardItems[rubro.key];
                return (
                  <Card key={rubro.key}>
                    <CardContent className="space-y-3 pt-5">
                      <div>
                        <h3 className="font-medium text-sm">{rubro.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rubro.description}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-1">
                          <Label className="text-xs">Monto mensual</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              min={0}
                              className="pl-7"
                              placeholder="0"
                              value={item.monthlyAmount || ""}
                              onChange={(e) =>
                                setLifeStandardItem(rubro.key, {
                                  monthlyAmount:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                            <input
                              type="checkbox"
                              checked={item.paidByObligor}
                              onChange={(e) =>
                                setLifeStandardItem(rubro.key, {
                                  paidByObligor: e.target.checked,
                                })
                              }
                              className="h-4 w-4"
                            />
                            <span>Lo paga directo el obligado</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Notas / desglose */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Notas y desglose adicional
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Detalla aquí lo que consideres necesario: desglose de
                    servicios del hogar, observaciones sobre disminución de
                    ingresos del obligado, montos anuales prorrateados, etc.
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                    placeholder="Ejemplo: Servicios del hogar incluye luz $1,500, agua $300, gas $500, internet $800, telefonía $400, Netflix $200..."
                    value={compensatory.lifeStandardNotes || ""}
                    onChange={(e) => setLifeStandardNotes(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Resumen */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">
                    Resumen de pensión compensatoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Nivel de vida total mensual
                    </span>
                    <span className="font-medium">
                      {formatCurrency(lifeStandardTotal)}
                    </span>
                  </div>
                  {obligorPaysDirectly > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        − Pagado directo por el obligado
                      </span>
                      <span className="font-medium">
                        {formatCurrency(obligorPaysDirectly)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm font-medium">
                      Pensión líquida mensual
                    </span>
                    <span className="text-xl font-bold">
                      {formatCurrency(liquidPension)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duración
                    </span>
                    <span className="text-sm">
                      {marriageDurationYears}{" "}
                      {marriageDurationYears === 1 ? "año" : "años"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm font-medium">Total estimado</span>
                    <Badge variant="secondary" className="text-sm">
                      {formatCurrency(
                        liquidPension * 12 * marriageDurationYears
                      )}
                    </Badge>
                  </div>

                  {exceedsIncome && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 mt-3">
                      <p className="text-sm font-medium text-red-800">
                        ⚠ La pensión líquida excede los ingresos del obligado
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Pensión líquida: {formatCurrency(liquidPension)} vs.
                        ingreso mensual del obligado:{" "}
                        {formatCurrency(obligorMonthlyIncome)}.
                        <br />
                        Si los ingresos del obligado disminuyeron, debe ser
                        comprobable documentalmente. Considera ajustar los
                        rubros o que el obligado pague directamente algunos
                        gastos.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
