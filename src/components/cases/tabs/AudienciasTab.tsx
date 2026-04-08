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

export default function AudienciasTab({
  caseId,
  hearings,
  onRefresh,
}: AudienciasTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "", result: "" });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: "",
    time: "",
    type: "",
    courtName: "",
  });

  const handleSave = async () => {
    if (!form.date || !form.type.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/hearings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time || null,
          type: form.type,
          courtName: form.courtName || null,
        }),
      });
      setForm({ date: "", time: "", type: "", courtName: "" });
      setShowForm(false);
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hearingId: string) => {
    if (!confirm("¿Eliminar esta audiencia?")) return;
    setDeleting(hearingId);
    try {
      await fetch(`/api/cases/${caseId}/hearings/${hearingId}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (hearing: any) => {
    setEditingId(hearing.id);
    setEditForm({
      status: hearing.status,
      result: hearing.result || "",
    });
  };

  const handleUpdate = async (hearingId: string) => {
    setUpdatingId(hearingId);
    try {
      await fetch(`/api/cases/${caseId}/hearings/${hearingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editForm.status,
          result: editForm.result || null,
        }),
      });
      setEditingId(null);
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setUpdatingId(null);
    }
  };

  const sortedHearings = [...hearings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
            <CardTitle className="text-base">Nueva audiencia</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
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

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Programar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de audiencias */}
      {sortedHearings.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se han programado audiencias.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sortedHearings.map((hearing: any) => (
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

                  {hearing.result && editingId !== hearing.id && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Resultado:</span>{" "}
                      {hearing.result}
                    </p>
                  )}

                  {/* Edición inline de status y resultado */}
                  {editingId === hearing.id && (
                    <div className="mt-3 space-y-3 rounded-lg border bg-muted/30 p-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Estado</Label>
                        <div className="flex flex-wrap gap-2">
                          {HEARING_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setEditForm((p) => ({ ...p, status: s }))
                              }
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                editForm.status === s
                                  ? STATUS_STYLES[s]
                                  : "hover:border-primary/40"
                              }`}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Resultado</Label>
                        <Input
                          value={editForm.result}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              result: e.target.value,
                            }))
                          }
                          placeholder="Resultado de la audiencia"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(hearing.id)}
                          disabled={updatingId === hearing.id}
                        >
                          {updatingId === hearing.id ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="mr-1 h-3.5 w-3.5" />
                          )}
                          Guardar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  {editingId !== hearing.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(hearing)}
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(hearing.id)}
                    disabled={deleting === hearing.id}
                    className="text-red-600 hover:text-red-700"
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
        ))}
      </div>
    </div>
  );
}
