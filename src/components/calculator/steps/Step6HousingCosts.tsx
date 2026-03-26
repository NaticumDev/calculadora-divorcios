"use client";

import { useCalculation } from "@/hooks/useCalculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { calculateHousingCosts } from "@/lib/calculations/housing-costs";
import type { HousingCostsInput } from "@/types/calculation";

type HousingKey = keyof HousingCostsInput;

interface HousingField {
  key: HousingKey;
  label: string;
  defaultValue: number;
}

const ONE_TIME_FIELDS: HousingField[] = [
  { key: "monthlyRent", label: "Renta mensual", defaultValue: 8000 },
  { key: "depositMonths", label: "Meses de depósito", defaultValue: 2 },
  { key: "movingCost", label: "Costo de mudanza", defaultValue: 4000 },
  { key: "basicFurniture", label: "Mobiliario básico", defaultValue: 20000 },
  { key: "electricitySetup", label: "Instalación CFE (electricidad)", defaultValue: 800 },
  { key: "waterSetup", label: "Instalación JAPAY (agua)", defaultValue: 500 },
  { key: "gasSetup", label: "Instalación gas", defaultValue: 1500 },
  { key: "internetSetup", label: "Instalación internet", defaultValue: 800 },
];

const MONTHLY_FIELDS: HousingField[] = [
  { key: "monthlyUtilities", label: "Servicios mensuales (luz, agua, gas, internet)", defaultValue: 2500 },
];

export default function Step6HousingCosts() {
  const { housing, setHousing } = useCalculation();

  const result = calculateHousingCosts(housing);

  const handleChange = (key: HousingKey, value: number) => {
    setHousing({ [key]: Math.max(0, value) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Costos de vivienda
        </h2>
        <p className="mt-1 text-muted-foreground">
          Estimación de costos para establecer un nuevo hogar en Mérida, Yucatán.
        </p>
      </div>

      {/* One-time costs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Costos únicos</CardTitle>
            <Badge variant="secondary">
              {formatCurrency(result.oneTimeTotal)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {ONE_TIME_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key} className="text-xs">
                  {field.label}
                </Label>
                <div className="relative">
                  {field.key !== "depositMonths" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                  )}
                  <Input
                    id={field.key}
                    type="number"
                    min={0}
                    className={`h-8 text-sm ${field.key !== "depositMonths" ? "pl-7" : ""}`}
                    value={housing[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly recurring costs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Costos mensuales recurrentes
            </CardTitle>
            <Badge variant="secondary">
              {formatCurrency(result.monthlyRecurring)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Rent is already in one-time but also recurs monthly */}
            <div className="flex items-center justify-between rounded-md bg-secondary/50 p-3">
              <span className="text-sm">Renta mensual</span>
              <span className="text-sm font-medium">
                {formatCurrency(housing.monthlyRent)}
              </span>
            </div>

            {MONTHLY_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`monthly-${field.key}`} className="text-xs">
                  {field.label}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    id={`monthly-${field.key}`}
                    type="number"
                    min={0}
                    className="h-8 pl-7 text-sm"
                    value={housing[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total costos únicos
            </span>
            <span className="font-medium">
              {formatCurrency(result.oneTimeTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total mensual recurrente
            </span>
            <span className="font-medium">
              {formatCurrency(result.monthlyRecurring)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium">Costo del primer mes</span>
            <span className="text-lg font-bold">
              {formatCurrency(result.firstMonthTotal)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
