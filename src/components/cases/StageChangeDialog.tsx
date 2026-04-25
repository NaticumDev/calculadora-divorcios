"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, CheckCircle2, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  STAGE_LABELS,
  TASK_TEMPLATES,
  type CaseLike,
  type CaseStage,
  type TaskTemplate,
  getMissingPrerequisites,
} from "@/lib/cases/stage-rules";

interface StageChangeDialogProps {
  caseId: string;
  caseData: CaseLike;
  currentStage: CaseStage;
  newStage: CaseStage;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function StageChangeDialog({
  caseId,
  caseData,
  currentStage,
  newStage,
  onClose,
  onConfirmed,
}: StageChangeDialogProps) {
  const missing = getMissingPrerequisites(newStage, caseData);
  const templates = TASK_TEMPLATES[newStage] || [];
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(
    new Set(templates.map((_, i) => i)) // Por defecto, todas seleccionadas
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const toggleTemplate = (index: number) => {
    const next = new Set(selectedTemplates);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedTemplates(next);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      // 1. Cambiar etapa
      const stageRes = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!stageRes.ok) {
        const data = await stageRes.json().catch(() => ({}));
        throw new Error(
          data.detail || data.error || `Error al cambiar etapa (${stageRes.status})`
        );
      }

      // 2. Crear tareas seleccionadas (si las hay)
      const tasksToCreate = templates.filter((_, i) =>
        selectedTemplates.has(i)
      );
      if (tasksToCreate.length > 0) {
        const today = new Date();
        await Promise.all(
          tasksToCreate.map((tpl: TaskTemplate) => {
            const dueDate =
              tpl.daysFromNow != null
                ? new Date(
                    today.getTime() + tpl.daysFromNow * 24 * 60 * 60 * 1000
                  ).toISOString()
                : null;
            return fetch(`/api/cases/${caseId}/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: tpl.title,
                description: tpl.description || null,
                priority: tpl.priority,
                dueDate,
              }),
            });
          })
        );
      }

      onConfirmed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar etapa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={saving}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold">Cambiar etapa</h2>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">{STAGE_LABELS[currentStage]}</span>
            {" → "}
            <span className="font-medium text-primary">
              {STAGE_LABELS[newStage]}
            </span>
          </p>
        </div>

        {/* Faltantes */}
        {missing.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-900">
                Datos sugeridos faltantes
              </p>
            </div>
            <p className="text-sm text-amber-800">
              Para esta etapa normalmente conviene tener registrado:
            </p>
            <ul className="text-sm text-amber-800 list-disc list-inside space-y-0.5 ml-1">
              {missing.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-xs text-amber-700 italic mt-2">
              Puedes continuar de todos modos. Esto es solo un recordatorio.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              Todos los datos sugeridos para esta etapa están registrados.
            </p>
          </div>
        )}

        {/* Plantillas de tareas */}
        {templates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ListPlus className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                Tareas comunes para esta etapa
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecciona las que quieres crear automáticamente. Después podrás
              editarlas o eliminarlas.
            </p>
            <div className="space-y-2">
              {templates.map((tpl, i) => {
                const checked = selectedTemplates.has(i);
                return (
                  <label
                    key={i}
                    className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTemplate(i)}
                      className="mt-0.5 h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tpl.title}</p>
                      {tpl.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tpl.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                        <span
                          className={
                            tpl.priority === 1
                              ? "text-red-600"
                              : tpl.priority === 2
                              ? "text-yellow-700"
                              : "text-green-700"
                          }
                        >
                          {tpl.priority === 1
                            ? "Alta"
                            : tpl.priority === 2
                            ? "Media"
                            : "Baja"}
                        </span>
                        {tpl.daysFromNow != null && (
                          <span>· Vence en {tpl.daysFromNow} días</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cambiando...
              </>
            ) : selectedTemplates.size > 0 ? (
              `Cambiar etapa y crear ${selectedTemplates.size} tarea${
                selectedTemplates.size === 1 ? "" : "s"
              }`
            ) : (
              "Cambiar etapa"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
