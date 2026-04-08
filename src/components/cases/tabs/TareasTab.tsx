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
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Loader2,
  X,
  CalendarDays,
} from "lucide-react";

interface TareasTabProps {
  caseId: string;
  tasks: any[];
  onRefresh: () => void;
}

const PRIORITY_BADGE: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-green-100 text-green-800 border-green-200",
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Alta",
  2: "Media",
  3: "Baja",
};

export default function TareasTab({
  caseId,
  tasks,
  onRefresh,
}: TareasTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    priority: 2,
  });

  const pendingTasks = tasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => a.priority - b.priority);

  const completedTasks = tasks
    .filter((t) => t.isCompleted)
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.updatedAt).getTime() -
        new Date(a.completedAt || a.updatedAt).getTime()
    );

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          dueDate: form.dueDate || null,
          priority: form.priority,
        }),
      });
      setForm({ title: "", dueDate: "", priority: 2 });
      setShowForm(false);
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task: any) => {
    setTogglingId(task.id);
    try {
      await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: !task.isCompleted,
          completedAt: !task.isCompleted ? new Date().toISOString() : null,
        }),
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    setDeletingId(taskId);
    try {
      await fetch(`/api/cases/${caseId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setDeletingId(null);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const renderTask = (task: any) => (
    <div
      key={task.id}
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        task.isCompleted ? "bg-muted/40 opacity-70" : ""
      }`}
    >
      <button
        onClick={() => handleToggle(task)}
        disabled={togglingId === task.id}
        className="mt-0.5 shrink-0"
      >
        {togglingId === task.id ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : task.isCompleted ? (
          <CheckSquare className="h-5 w-5 text-green-600" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.isCompleted ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Badge className={PRIORITY_BADGE[task.priority] || ""}>
            {PRIORITY_LABELS[task.priority] || "Media"}
          </Badge>
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-xs ${
                !task.isCompleted && isOverdue(task.dueDate)
                  ? "text-red-600 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <CalendarDays className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("es-MX")}
              {!task.isCompleted && isOverdue(task.dueDate) && " (vencida)"}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(task.id)}
        disabled={deletingId === task.id}
        className="text-red-600 hover:text-red-700 shrink-0"
      >
        {deletingId === task.id ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Formulario inline */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva tarea
        </Button>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Nueva tarea</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Descripción de la tarea"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fecha límite</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Prioridad</Label>
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      form.priority === p
                        ? PRIORITY_BADGE[p]
                        : "hover:border-primary/40"
                    }`}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
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

      {/* Tareas pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pendientes ({pendingTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay tareas pendientes.
            </p>
          ) : (
            pendingTasks.map(renderTask)
          )}
        </CardContent>
      </Card>

      {/* Tareas completadas */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Completadas ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.map(renderTask)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
