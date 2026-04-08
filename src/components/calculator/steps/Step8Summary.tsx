"use client";

import { useEffect } from "react";
import { useCalculation } from "@/hooks/useCalculation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function Step8Summary() {
  const { result, calculate, reset, prevStep } = useCalculation();

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Calculando resultados...</p>
      </div>
    );
  }

  const {
    childSupport,
    compensatory,
    housing,
    legalFees,
    monthlyTotal,
    annualTotal,
    oneTimeCosts,
    projections,
  } = result;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Resumen del cálculo
        </h2>
        <p className="mt-1 text-muted-foreground">
          Resultado estimado de los costos del divorcio.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pensión alimenticia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(childSupport.monthlyTotal)}
            </p>
            <p className="text-xs text-muted-foreground">
              {childSupport.percentage > 0
                ? `${(childSupport.percentage * 100).toFixed(0)}% del ingreso del obligado`
                : "No aplica"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pensión compensatoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {compensatory
                ? formatCurrency(compensatory.selectedMonthly)
                : formatCurrency(0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {compensatory && compensatory.durationYears > 0
                ? `Por ${compensatory.durationYears} ${compensatory.durationYears === 1 ? "año" : "años"}`
                : "No solicitada"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Costos de vivienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(housing.monthlyRecurring)}
            </p>
            <p className="text-xs text-muted-foreground">
              Recurrente mensual (+ {formatCurrency(housing.oneTimeTotal)} únicos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Honorarios legales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(legalFees.total)}
            </p>
            <p className="text-xs text-muted-foreground">Pago único</p>
          </CardContent>
        </Card>
      </div>

      {/* Grand totals */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Resumen total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total mensual</span>
            <span className="text-xl font-bold">
              {formatCurrency(monthlyTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total anual</span>
            <span className="text-lg font-semibold">
              {formatCurrency(annualTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">
              Costos únicos (vivienda + legales)
            </span>
            <Badge variant="secondary" className="text-sm">
              {formatCurrency(oneTimeCosts)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Projections table */}
      {projections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proyecciones anuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-medium">Año</th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Alimenticia
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Compensatoria
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Vivienda
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Total anual
                    </th>
                    <th className="pb-2 text-right font-medium">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((row) => (
                    <tr key={row.year} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <span className="font-medium">Año {row.year}</span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({row.calendarYear})
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {formatCurrency(row.childSupportAnnual)}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {formatCurrency(row.compensatoryAnnual)}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {formatCurrency(row.housingAnnual)}
                      </td>
                      <td className="py-2 pr-4 text-right font-medium">
                        {formatCurrency(row.totalAnnual)}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {formatCurrency(row.cumulativeTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Aviso legal</p>
        <p className="mt-1">
          Esta herramienta proporciona estimaciones con fines informativos
          únicamente. Los montos reales son determinados por la autoridad
          judicial conforme al Código de Familia para el Estado de Yucatán.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={prevStep}>
          Anterior
        </Button>
        <Button variant="outline" disabled>
          Descargar PDF
        </Button>
        <Button variant="outline" disabled>
          Guardar cálculo
        </Button>
        <Button variant="destructive" onClick={reset}>
          Nuevo cálculo
        </Button>
      </div>
    </div>
  );
}
