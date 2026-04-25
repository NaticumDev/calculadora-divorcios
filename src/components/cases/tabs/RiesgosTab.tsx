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
  Edit2,
  Save,
  CheckCircle2,
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    category: "NEGOCIACION" as string,
    level: "MEDIO" as string,
    title: "",
    description: "",
    mitigationStrategy: "",
    isActive: true as boolean,
  });

  const resetForm = () => {
    setForm({
      category: "NEGOCIACION",
      level: "MEDIO",
      title: "",
      description: "",
      mitigationStrategy: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (risk: any) => {
    setForm({
      category: risk.category || "NEGOCIACION",
      level: risk.level || "MEDIO",
      title: risk.title || "",
      description: risk.description || "",
      mitigationStrategy: risk.mitigationStrategy || "",
      isActive: risk.isActive !== false,
    });
    setEditingId(risk.id);
    setShowForm(true);
    setError("");
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Título y descripción son obligatorios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `/api/cases/${caseId}/risks/${editingId}`
        : `/api/cases/${caseId}/risks`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          level: form.level,
          title: form.title,
          description: form.description,
          mitigationStrategy: form.mitigationStrategy || null,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `Error ${res.status}`);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (risk: any) => {
    setTogglingId(risk.id);
    setError("");
    try {
      const res = await fetch(`/api/cases/${caseId}/risks/${risk.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: risk.category,
          level: risk.level,
          title: risk.title,
          description: risk.description,
          mitigationStrategy: risk.mitigationStrategy,
          isActive: !risk.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `Error ${res.status}`);
      }
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (riskId: string, title: string) => {
    if (!confirm(`¿Eliminar el riesgo "${title}"?`)) return;
    setDeleting(riskId);
    setError("");
    try {
      const res = await fetch(`/api/cases/${caseId}/risks/${riskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `Error ${res.status}`);
      }
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  // Solo contar riesgos activos en el resumen
  const activeRisks = risks.filter((r) => r.isActive !== false);
  const altos = activeRisks.filter((r) => r.level === "ALTO");
  const medios = activeRisks.filter((r) => r.level === "MEDIO");
  const bajos = activeRisks.filter((r) => r.level === "BAJO");

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
            <CardTitle className="text-base">
              {editingId ? "Editar riesgo" : "Nuevo riesgo"}
            </CardTitle>
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

            {editingId && (
              <div className="flex items-center gap-2 rounded-md border p-3">
                <input
                  type="checkbox"
                  id="risk-active"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="risk-active" className="text-sm cursor-pointer">
                  Riesgo activo (desmarca si ya fue mitigado o ya no aplica)
                </Label>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : editingId ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingId ? "Guardar cambios" : "Agregar"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
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

      {error && !showForm && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {risks.map((risk: any) => {
          const inactive = risk.isActive === false;
          return (
            <Card
              key={risk.id}
              className={`${
                inactive
                  ? "border-gray-200 bg-gray-50 opacity-70"
                  : LEVEL_STYLES[risk.level] || ""
              }`}
            >
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm">
                      {risk.title}
                      {inactive && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (mitigado)
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className={LEVEL_BADGE[risk.level] || ""}>
                        {LEVEL_LABELS[risk.level] || risk.level}
                      </Badge>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[risk.category] || risk.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-0.5 -mt-1 -mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(risk)}
                      disabled={togglingId === risk.id}
                      title={inactive ? "Reactivar" : "Marcar como mitigado"}
                    >
                      {togglingId === risk.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            inactive ? "text-muted-foreground" : "text-green-600"
                          }`}
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(risk)}
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(risk.id, risk.title)}
                      disabled={deleting === risk.id}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar"
                    >
                      {deleting === risk.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
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
          );
        })}
      </div>
    </div>
  );
}
