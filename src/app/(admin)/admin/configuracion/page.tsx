"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ConfigData {
  voluntaryDivorceFee: number;
  contestedDivorceFee: number;
  additionalFees: string;
  defaultChildSupportPct1Child: number;
  defaultChildSupportPct2Child: number;
  defaultChildSupportPct3Plus: number;
  defaultRentEstimate: number;
  defaultDepositMonths: number;
  defaultMovingCost: number;
  defaultFurnitureCost: number;
  defaultUtilitiesSetup: number;
  currentUMA: number;
  currentMinimumWage: number;
}

const defaultConfig: ConfigData = {
  voluntaryDivorceFee: 15000,
  contestedDivorceFee: 35000,
  additionalFees: "",
  defaultChildSupportPct1Child: 15,
  defaultChildSupportPct2Child: 20,
  defaultChildSupportPct3Plus: 30,
  defaultRentEstimate: 6000,
  defaultDepositMonths: 2,
  defaultMovingCost: 3000,
  defaultFurnitureCost: 15000,
  defaultUtilitiesSetup: 3000,
  currentUMA: 113.14,
  currentMinimumWage: 278.80,
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfigData>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data = await res.json();
          setConfig({ ...defaultConfig, ...data });
        }
      } catch {
        console.error("Error loading config");
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  function updateField(field: keyof ConfigData, value: string) {
    const numValue = parseFloat(value) || 0;
    setConfig((prev) => ({ ...prev, [field]: numValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar la configuración.");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error de conexión. Intente de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Ajusta los valores predeterminados para los cálculos de divorcio.
        </p>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
          Configuración guardada exitosamente.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honorarios */}
        <Card>
          <CardHeader>
            <CardTitle>Honorarios</CardTitle>
            <CardDescription>
              Tarifas de honorarios legales por tipo de divorcio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="voluntaryFee">
                  Divorcio voluntario (MXN)
                </Label>
                <Input
                  id="voluntaryFee"
                  type="number"
                  step="0.01"
                  value={config.voluntaryDivorceFee}
                  onChange={(e) =>
                    updateField("voluntaryDivorceFee", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contestedFee">
                  Divorcio contencioso (MXN)
                </Label>
                <Input
                  id="contestedFee"
                  type="number"
                  step="0.01"
                  value={config.contestedDivorceFee}
                  onChange={(e) =>
                    updateField("contestedDivorceFee", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pension alimenticia */}
        <Card>
          <CardHeader>
            <CardTitle>Porcentajes de pensión alimenticia</CardTitle>
            <CardDescription>
              Porcentaje del ingreso del obligado según el número de hijos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pct1">1 hijo (%)</Label>
                <Input
                  id="pct1"
                  type="number"
                  step="0.1"
                  value={config.defaultChildSupportPct1Child}
                  onChange={(e) =>
                    updateField("defaultChildSupportPct1Child", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pct2">2 hijos (%)</Label>
                <Input
                  id="pct2"
                  type="number"
                  step="0.1"
                  value={config.defaultChildSupportPct2Child}
                  onChange={(e) =>
                    updateField("defaultChildSupportPct2Child", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pct3">3+ hijos (%)</Label>
                <Input
                  id="pct3"
                  type="number"
                  step="0.1"
                  value={config.defaultChildSupportPct3Plus}
                  onChange={(e) =>
                    updateField("defaultChildSupportPct3Plus", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Costos de vivienda */}
        <Card>
          <CardHeader>
            <CardTitle>Costos de vivienda predeterminados</CardTitle>
            <CardDescription>
              Valores estimados para los gastos de vivienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rent">Renta mensual estimada (MXN)</Label>
                <Input
                  id="rent"
                  type="number"
                  step="0.01"
                  value={config.defaultRentEstimate}
                  onChange={(e) =>
                    updateField("defaultRentEstimate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Meses de depósito</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={config.defaultDepositMonths}
                  onChange={(e) =>
                    updateField("defaultDepositMonths", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moving">Costo de mudanza (MXN)</Label>
                <Input
                  id="moving"
                  type="number"
                  step="0.01"
                  value={config.defaultMovingCost}
                  onChange={(e) =>
                    updateField("defaultMovingCost", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="furniture">Mobiliario básico (MXN)</Label>
                <Input
                  id="furniture"
                  type="number"
                  step="0.01"
                  value={config.defaultFurnitureCost}
                  onChange={(e) =>
                    updateField("defaultFurnitureCost", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utilities">
                  Instalación de servicios (MXN)
                </Label>
                <Input
                  id="utilities"
                  type="number"
                  step="0.01"
                  value={config.defaultUtilitiesSetup}
                  onChange={(e) =>
                    updateField("defaultUtilitiesSetup", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores económicos */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores económicos</CardTitle>
            <CardDescription>
              Valores actuales de referencia para los cálculos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="uma">UMA diaria (MXN)</Label>
                <Input
                  id="uma"
                  type="number"
                  step="0.01"
                  value={config.currentUMA}
                  onChange={(e) => updateField("currentUMA", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minWage">Salario mínimo diario (MXN)</Label>
                <Input
                  id="minWage"
                  type="number"
                  step="0.01"
                  value={config.currentMinimumWage}
                  onChange={(e) =>
                    updateField("currentMinimumWage", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar configuración
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
