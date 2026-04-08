"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldAlert,
  Plus,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

interface RiesgosTabProps {
  caseId: string;
  risks: any[];
  onRefresh: () => void;
}

const LEVEL_STYLES: Record<string, string> = {
  ALTO: "border-red-300 bg-red-50",
  MEDIO: "border-yellow-300 bg-yellow-50",
  BAJO: "border-green-300 bg-green-50",
};

const LEVEL_BADGE: Record<string, string> = {
  ALTO: "bg-red-100 text-red-800 border-red-200",
  MEDIO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  BAJO: "bg-green-100 text-green-800 border-green-200",
};

const LEVEL_LABELS: Record<string, string> = {
  ALTO: "Alto",
  MEDIO: "Medio",
  BAJO: "Bajo",
};

const CATEGORIES = [
  "NEGOCIACION",
  "PATRIMONIO",
  "HIJOS",
  "PROCESAL",
  "VIOLENCIA",
  "CORPORATIVO",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  NEGOCIACION: "Negociación",
  PATRIMONIO: "Patrimonio",
  HIJOS: "Hijos",
  PROCESAL: "Procesal",
  VIOLENCIA: "Violencia",
  CORPORATIVO: "Corporativo",
};

export default function RiesgosTab({
  caseId,
  risks,
  onRefresh,
}: RiesgosTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "NEGOCIACION" as string,
    level: "MEDIO" as string,
    title: "",
    description: "",
    mitigationStrategy: "",
  });

  const resetForm = () => {
    setForm({
      category: "NEGOCIACION",
      level: "MEDIO",
      title: "",
      description: "",
      mitigationStrategy: "",
    });
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/risks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          level: form.level,
          title: form.title,
          description: form.description,
          mitigationStrategy: form.mitigationStrategy || null,
        }),
      });
      resetForm();
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (riskId: string) => {
    if (!confirm("¿Eliminar este riesgo?")) return;
    setDeleting(riskId);
    try {
      await fetch(`/api/cases/${caseId}/risks/${riskId}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setDeleting(null);
    }
  };

  const altos = risks.filter((r) => r.level === "ALTO");
  const medios = risks.filter((r) => r.level === "MEDIO");
  const bajos = risks.filter((r) => r.level === "BAJO");

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-200">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Riesgo alto</p>
              <p className="text-2xl font-bold text-red-600">
                {altos.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-2">
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Riesgo medio</p>
              <p className="text-2xl font-bold text-yellow-600">
                {medios.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <ShieldAlert className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Riesgo bajo</p>
              <p className="text-2xl font-bold text-green-600">
                {bajos.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón agregar */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar riesgo
        </Button>
      )}

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Nuevo riesgo</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Categoría *</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      form.category === cat
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Nivel de riesgo *</Label>
              <div className="flex gap-2">
                {(["ALTO", "MEDIO", "BAJO"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setForm((p) => ({ ...p, level }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      form.level === level
                        ? LEVEL_STYLES[level]
                        : "hover:border-primary/40"
                    }`}
                  >
                    {LEVEL_LABELS[level]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Título del riesgo"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descripción *</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Descripción del riesgo"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Estrategia de mitigación</Label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[60px]"
                value={form.mitigationStrategy}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    mitigationStrategy: e.target.value,
                  }))
                }
                placeholder="Cómo se mitigará este riesgo..."
              />
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Agregar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de riesgos */}
      {risks.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se han identificado riesgos en este caso.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {risks.map((risk: any) => (
          <Card
            key={risk.id}
            className={LEVEL_STYLES[risk.level] || ""}
          >
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{risk.title}</p>
                  <div className="flex gap-1.5">
                    <Badge className={LEVEL_BADGE[risk.level] || ""}>
                      {LEVEL_LABELS[risk.level] || risk.level}
                    </Badge>
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[risk.category] || risk.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(risk.id)}
                  disabled={deleting === risk.id}
                  className="text-red-600 hover:text-red-700 -mt-1 -mr-2"
                >
                  {deleting === risk.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {risk.description}
              </p>

              {risk.mitigationStrategy && (
                <div className="rounded-md bg-white/60 p-2.5">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Mitigación
                  </p>
                  <p className="text-xs">{risk.mitigationStrategy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
