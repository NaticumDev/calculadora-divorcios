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
  CalendarDays,
  Clock,
  Gavel,
  Plus,
  Trash2,
  Loader2,
  X,
  Save,
  Edit2,
} from "lucide-react";

interface AudienciasTabProps {
  caseId: string;
  hearings: any[];
  onRefresh: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  PROGRAMADA: "bg-blue-100 text-blue-800 border-blue-200",
  REALIZADA: "bg-green-100 text-green-800 border-green-200",
  SUSPENDIDA: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELADA: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PROGRAMADA: "Programada",
  REALIZADA: "Realizada",
  SUSPENDIDA: "Suspendida",
  CANCELADA: "Cancelada",
};

const HEARING_STATUSES = ["PROGRAMADA", "REALIZADA", "SUSPENDIDA", "CANCELADA"];

const EMPTY_FORM = {
  date: "",
  time: "",
  type: "",
  courtName: "",
  status: "PROGRAMADA",
  result: "",
  notes: "",
};

export default function AudienciasTab({
  caseId,
  hearings,
  onRefresh,
}: AudienciasTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState(EMPTY_FORM);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (hearing: any) => {
    setForm({
      date: hearing.date
        ? new Date(hearing.date).toISOString().split("T")[0]
        : "",
      time: hearing.time || "",
      type: hearing.type || "",
      courtName: hearing.courtName || "",
      status: hearing.status || "PROGRAMADA",
      result: hearing.result || "",
      notes: hearing.notes || "",
    });
    setEditingId(hearing.id);
    setShowForm(true);
    setError("");
  };

  const handleSave = async () => {
    if (!form.date || !form.type.trim()) {
      setError("Fecha y tipo de audiencia son obligatorios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `/api/cases/${caseId}/hearings/${editingId}`
        : `/api/cases/${caseId}/hearings`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time || null,
          type: form.type,
          courtName: form.courtName || null,
          status: form.status,
          result: form.result || null,
          notes: form.notes || null,
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

  const handleDelete = async (hearingId: string, type: string) => {
    if (!confirm(`¿Eliminar la audiencia de "${type}"?`)) return;
    setDeleting(hearingId);
    setError("");
    try {
      const res = await fetch(`/api/cases/${caseId}/hearings/${hearingId}`, {
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

  // Separar próximas vs pasadas
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = hearings
    .filter(
      (h) =>
        h.status === "PROGRAMADA" && new Date(h.date) >= now
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const past = hearings
    .filter(
      (h) =>
        h.status !== "PROGRAMADA" || new Date(h.date) < now
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderHearing = (hearing: any) => (
    <Card key={hearing.id}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {new Date(hearing.date).toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {hearing.time && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {hearing.time}
                </div>
              )}
              <Badge className={STATUS_STYLES[hearing.status] || ""}>
                {STATUS_LABELS[hearing.status] || hearing.status}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <Gavel className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{hearing.type}</span>
              {hearing.courtName && (
                <span className="text-muted-foreground">
                  &middot; {hearing.courtName}
                </span>
              )}
            </div>

            {hearing.result && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Resultado:</span>{" "}
                {hearing.result}
              </p>
            )}
            {hearing.notes && (
              <p className="text-sm text-muted-foreground italic">
                {hearing.notes}
              </p>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEdit(hearing)}
              title="Editar"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(hearing.id, hearing.type)}
              disabled={deleting === hearing.id}
              className="text-red-600 hover:text-red-700"
              title="Eliminar"
            >
              {deleting === hearing.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Botón agregar */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Programar audiencia
        </Button>
      )}

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">
              {editingId ? "Editar audiencia" : "Nueva audiencia"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Fecha *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hora</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de audiencia *</Label>
                <Input
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, type: e.target.value }))
                  }
                  placeholder="Ej: Conciliación, Pruebas, Alegatos..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Juzgado</Label>
                <Input
                  value={form.courtName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, courtName: e.target.value }))
                  }
                  placeholder="Nombre del juzgado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Estado</Label>
              <div className="flex flex-wrap gap-2">
                {HEARING_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((p) => ({ ...p, status: s }))}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      form.status === s
                        ? STATUS_STYLES[s]
                        : "hover:border-primary/40"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {(form.status === "REALIZADA" ||
              form.status === "SUSPENDIDA" ||
              form.status === "CANCELADA") && (
              <div className="space-y-1">
                <Label className="text-xs">Resultado</Label>
                <Input
                  value={form.result}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, result: e.target.value }))
                  }
                  placeholder="Resultado de la audiencia"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Notas</Label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[60px]"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Observaciones, recordatorios, comparecientes..."
              />
            </div>

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
                {editingId ? "Guardar cambios" : "Programar"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && !showForm && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Sin audiencias */}
      {hearings.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se han programado audiencias.
          </CardContent>
        </Card>
      )}

      {/* Próximas */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Próximas ({upcoming.length})
          </h3>
          {upcoming.map(renderHearing)}
        </div>
      )}

      {/* Pasadas */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Históricas ({past.length})
          </h3>
          {past.map(renderHearing)}
        </div>
      )}
    </div>
  );
}
