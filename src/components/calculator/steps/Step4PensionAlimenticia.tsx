"use client";

import { useState, useEffect, useCallback } from "react";
import { useCalculation } from "@/hooks/useCalculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { YUCATAN_DEFAULTS } from "@/lib/calculations/constants";
import { calculateChildSupport } from "@/lib/calculations/pension-alimenticia";
import type { ChildExpenseBreakdown } from "@/types/calculation";

const EXPENSE_KEYS = ["food", "education", "health", "clothing", "housing", "recreation"] as const;
const EXPENSE_LABELS: Record<string, string> = {
  food: "Alimentación",
  education: "Educación",
  health: "Salud",
  clothing: "Vestido",
  housing: "Habitación",
  recreation: "Esparcimiento",
};

export default function Step4PensionAlimenticia() {
  const {
    numberOfChildren,
    childrenAges,
    obligorMonthlyIncome,
    isDetailedChildSupport,
    childSupport,
    setChildSupportPercentage,
    setDetailedChildSupport,
    setChildBreakdown,
  } = useCalculation();

  const defaultPct =
    YUCATAN_DEFAULTS.CHILD_SUPPORT_PERCENTAGES[
      Math.min(numberOfChildren, 3)
    ] ?? YUCATAN_DEFAULTS.CHILD_SUPPORT_PERCENTAGES[1];

  const [percentage, setPercentage] = useState(
    (childSupport.customPercentage ?? defaultPct) * 100
  );

  const [breakdowns, setBreakdowns] = useState<ChildExpenseBreakdown[]>(() => {
    if (childSupport.detailedBreakdown && childSupport.detailedBreakdown.length > 0) {
      return childSupport.detailedBreakdown;
    }
    return buildDefaultBreakdowns();
  });

  function buildDefaultBreakdowns(): ChildExpenseBreakdown[] {
    const pct = (childSupport.customPercentage ?? defaultPct);
    const total = obligorMonthlyIncome * pct;
    const dist = YUCATAN_DEFAULTS.EXPENSE_DISTRIBUTION;

    return childrenAges.map((age) => {
      const perChild = total / Math.max(numberOfChildren, 1);
      return {
        childAge: age,
        food: Math.round(perChild * dist.food.percentage),
        education: Math.round(perChild * dist.education.percentage),
        health: Math.round(perChild * dist.health.percentage),
        clothing: Math.round(perChild * dist.clothing.percentage),
        housing: Math.round(perChild * dist.housing.percentage),
        recreation: Math.round(perChild * dist.recreation.percentage),
        total: Math.round(perChild),
      };
    });
  }

  useEffect(() => {
    if (!isDetailedChildSupport) {
      setBreakdowns(buildDefaultBreakdowns());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, numberOfChildren, childrenAges, obligorMonthlyIncome]);

  if (numberOfChildren === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Pensión alimenticia
          </h2>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No hay hijos menores, no aplica pensión alimenticia.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Puede continuar al siguiente paso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthlyAmount = obligorMonthlyIncome * (percentage / 100);
  const perChild = monthlyAmount / numberOfChildren;

  const result = calculateChildSupport({
    obligorMonthlyIncome,
    numberOfChildren,
    childrenAges,
    customPercentage: percentage / 100,
    detailedBreakdown: isDetailedChildSupport ? breakdowns : undefined,
  });

  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    setChildSupportPercentage(value / 100);
  };

  const handleToggleDetailed = (enabled: boolean) => {
    setDetailedChildSupport(enabled);
    if (enabled) {
      const newBreakdowns = buildDefaultBreakdowns();
      setBreakdowns(newBreakdowns);
      setChildBreakdown(newBreakdowns);
    }
  };

  const handleExpenseChange = (
    childIndex: number,
    key: string,
    value: number
  ) => {
    const updated = [...breakdowns];
    const child = { ...updated[childIndex], [key]: Math.max(0, value) };
    child.total =
      child.food +
      child.education +
      child.health +
      child.clothing +
      child.housing +
      child.recreation;
    updated[childIndex] = child;
    setBreakdowns(updated);
    setChildBreakdown(updated);
  };

  const totalDetailed = breakdowns.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Pensión alimenticia
        </h2>
        <p className="mt-1 text-muted-foreground">
          Configure la pensión alimenticia para {numberOfChildren}{" "}
          {numberOfChildren === 1 ? "hijo" : "hijos"} menor
          {numberOfChildren === 1 ? "" : "es"}.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <span
          className={`text-sm ${!isDetailedChildSupport ? "font-medium" : "text-muted-foreground"}`}
        >
          Modo rápido
        </span>
        <Switch
          checked={isDetailedChildSupport}
          onCheckedChange={handleToggleDetailed}
        />
        <span
          className={`text-sm ${isDetailedChildSupport ? "font-medium" : "text-muted-foreground"}`}
        >
          Modo detallado
        </span>
      </div>

      {!isDetailedChildSupport ? (
        /* Quick mode */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Porcentaje del ingreso del obligado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Porcentaje</Label>
                <Badge variant="secondary">{percentage.toFixed(0)}%</Badge>
              </div>
              <Slider
                min={5}
                max={40}
                step={1}
                value={percentage}
                onChange={(e) =>
                  handlePercentageChange(parseFloat(e.target.value))
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span>
                  Sugerido: {(defaultPct * 100).toFixed(0)}% para{" "}
                  {numberOfChildren} {numberOfChildren === 1 ? "hijo" : "hijos"}
                </span>
                <span>40%</span>
              </div>
            </div>

            <div className="rounded-md bg-secondary/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pensión mensual total
                </span>
                <span className="text-lg font-bold">
                  {formatCurrency(monthlyAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Por hijo (promedio)
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(perChild)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Detailed mode */
        <div className="space-y-4">
          {breakdowns.map((child, childIndex) => (
            <Card key={childIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Hijo {childIndex + 1} ({child.childAge} años)
                  </CardTitle>
                  <Badge>Total: {formatCurrency(child.total)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXPENSE_KEYS.map((key) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">
                        {EXPENSE_LABELS[key]}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          min={0}
                          className="pl-7 h-8 text-sm"
                          value={child[key]}
                          onChange={(e) =>
                            handleExpenseChange(
                              childIndex,
                              key,
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Total pensión alimenticia mensual
                </span>
                <span className="text-lg font-bold">
                  {formatCurrency(totalDetailed)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
