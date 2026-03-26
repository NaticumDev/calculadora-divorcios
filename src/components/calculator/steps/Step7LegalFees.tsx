"use client";

import { useState } from "react";
import { useCalculation } from "@/hooks/useCalculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function Step7LegalFees() {
  const { divorceType, legalFees, setLegalFees } = useCalculation();

  const [baseFee, setBaseFee] = useState(legalFees.baseFee);
  const [additionalFees, setAdditionalFees] = useState<
    { name: string; amount: number }[]
  >(legalFees.additionalFees);
  const [newFeeName, setNewFeeName] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState(0);

  const totalAdditional = additionalFees.reduce(
    (sum, fee) => sum + fee.amount,
    0
  );
  const totalFees = baseFee + totalAdditional;

  const syncToStore = (
    base: number,
    additional: { name: string; amount: number }[]
  ) => {
    setLegalFees(base, additional);
  };

  const handleBaseFeeChange = (value: number) => {
    const clamped = Math.max(0, value);
    setBaseFee(clamped);
    syncToStore(clamped, additionalFees);
  };

  const handleAddFee = () => {
    if (!newFeeName.trim() || newFeeAmount <= 0) return;
    const updated = [...additionalFees, { name: newFeeName.trim(), amount: newFeeAmount }];
    setAdditionalFees(updated);
    syncToStore(baseFee, updated);
    setNewFeeName("");
    setNewFeeAmount(0);
  };

  const handleRemoveFee = (index: number) => {
    const updated = additionalFees.filter((_, i) => i !== index);
    setAdditionalFees(updated);
    syncToStore(baseFee, updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Honorarios legales
        </h2>
        <p className="mt-1 text-muted-foreground">
          Estimación de costos legales para un divorcio{" "}
          {divorceType === "VOLUNTARIO" ? "voluntario" : "contencioso"}.
        </p>
      </div>

      {/* Base fee */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Honorarios base</CardTitle>
            <Badge variant="outline">
              {divorceType === "VOLUNTARIO" ? "Voluntario" : "Contencioso"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseFee">Honorarios del abogado</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="baseFee"
                type="number"
                min={0}
                className="pl-7"
                value={baseFee}
                onChange={(e) =>
                  handleBaseFeeChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Honorarios estimados para un abogado en Mérida, Yucatán. Puede
              modificar el monto según su cotización.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {additionalFees.length > 0 && (
            <div className="space-y-2">
              {additionalFees.map((fee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{fee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(fee.amount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveFee(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-md border border-dashed p-4">
            <p className="text-sm font-medium">Agregar gasto</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="newFeeName" className="text-xs">
                  Concepto
                </Label>
                <Input
                  id="newFeeName"
                  placeholder="Ej. Gastos notariales"
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newFeeAmount" className="text-xs">
                  Monto
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="newFeeAmount"
                    type="number"
                    min={0}
                    className="pl-7"
                    value={newFeeAmount || ""}
                    onChange={(e) =>
                      setNewFeeAmount(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFee}
              disabled={!newFeeName.trim() || newFeeAmount <= 0}
            >
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Honorarios base
            </span>
            <span className="font-medium">{formatCurrency(baseFee)}</span>
          </div>
          {totalAdditional > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Gastos adicionales
              </span>
              <span className="font-medium">
                {formatCurrency(totalAdditional)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium">Total honorarios legales</span>
            <span className="text-lg font-bold">
              {formatCurrency(totalFees)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
