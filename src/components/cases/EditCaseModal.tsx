"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditCaseModalProps {
  caseData: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditCaseModal({
  caseData,
  onClose,
  onSaved,
}: EditCaseModalProps) {
  const [form, setForm] = useState({
    divorceType: caseData.divorceType || "VOLUNTARIO",
    propertyRegime: caseData.propertyRegime || "",
    courtName: caseData.courtName || "",
    courtFileNumber: caseData.courtFileNumber || "",
    opposingLawyer: caseData.opposingLawyer || "",
    opposingLawyerPhone: caseData.opposingLawyerPhone || "",
    opposingLawyerEmail: caseData.opposingLawyerEmail || "",
    estimatedDurationMonths:
      caseData.estimatedDurationMonths != null
        ? String(caseData.estimatedDurationMonths)
        : "",
    startDate: caseData.startDate
      ? new Date(caseData.startDate).toISOString().split("T")[0]
      : "",
    endDate: caseData.endDate
      ? new Date(caseData.endDate).toISOString().split("T")[0]
      : "",
    totalAgreedFee:
      caseData.totalAgreedFee != null ? String(caseData.totalAgreedFee) : "0",
    internalNotes: caseData.internalNotes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSave = async () => {
    // Confirmación si está cerrando el caso (endDate nuevo)
    const willCloseCase = form.endDate && !caseData.endDate;
    if (willCloseCase) {
      if (
        !confirm(
          "Estás registrando una fecha de cierre del caso. Esto indica que el caso ha concluido. ¿Continuar?"
        )
      ) {
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divorceType: form.divorceType,
          propertyRegime: form.propertyRegime || null,
          courtName: form.courtName || null,
          courtFileNumber: form.courtFileNumber || null,
          opposingLawyer: form.opposingLawyer || null,
          opposingLawyerPhone: form.opposingLawyerPhone || null,
          opposingLawyerEmail: form.opposingLawyerEmail || null,
          estimatedDurationMonths: form.estimatedDurationMonths
            ? Number(form.estimatedDurationMonths)
            : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          totalAgreedFee: form.totalAgreedFee
            ? Number(form.totalAgreedFee)
            : 0,
          internalNotes: form.internalNotes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `Error ${res.status}`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold">Editar caso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Caso {caseData.caseNumber}. Modifica los datos administrativos del expediente.
          </p>
        </div>

        {/* Tipo y régimen */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de divorcio</Label>
            <div className="flex gap-2">
              {(["VOLUNTARIO", "CONTENCIOSO"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((p) => ({ ...p, divorceType: type }))}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    form.divorceType === type
                      ? type === "VOLUNTARIO"
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20"
                        : "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500/20"
                      : "hover:border-primary/40"
                  }`}
                >
                  {type === "VOLUNTARIO" ? "Voluntario" : "Contencioso"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Régimen patrimonial</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: "", label: "Por confirmar" },
                  { value: "SOCIEDAD_CONYUGAL", label: "Sociedad conyugal" },
                  { value: "SEPARACION_BIENES", label: "Separación de bienes" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setForm((p) => ({ ...p, propertyRegime: opt.value }))
                  }
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    form.propertyRegime === opt.value
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datos del juzgado */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Datos judiciales
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Juzgado</Label>
              <Input
                value={form.courtName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courtName: e.target.value }))
                }
                placeholder="Ej: Juzgado Tercero de lo Familiar"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Número de expediente judicial</Label>
              <Input
                value={form.courtFileNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courtFileNumber: e.target.value }))
                }
                placeholder="Ej: 1234/2026"
              />
            </div>
          </div>
        </div>

        {/* Abogado contrario */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Abogado de la contraparte
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Nombre</Label>
              <Input
                value={form.opposingLawyer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, opposingLawyer: e.target.value }))
                }
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Teléfono</Label>
              <Input
                value={form.opposingLawyerPhone}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    opposingLawyerPhone: e.target.value,
                  }))
                }
                placeholder="999 123 4567"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.opposingLawyerEmail}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    opposingLawyerEmail: e.target.value,
                  }))
                }
                placeholder="abogado@ejemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Honorarios y duración */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Honorarios y duración
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Honorarios pactados ($)</Label>
              <Input
                type="number"
                value={form.totalAgreedFee}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalAgreedFee: e.target.value }))
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Duración estimada (meses)</Label>
              <Input
                type="number"
                value={form.estimatedDurationMonths}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    estimatedDurationMonths: e.target.value,
                  }))
                }
                placeholder="3"
              />
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Fechas
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Fecha de inicio</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Fecha de cierre
                <span className="text-muted-foreground ml-1 font-normal">
                  (solo si concluyó)
                </span>
              </Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Notas internas */}
        <div className="space-y-2">
          <Label className="text-xs">
            Notas internas
            <span className="text-muted-foreground ml-1 font-normal">
              (no visibles para el cliente)
            </span>
          </Label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
            value={form.internalNotes}
            onChange={(e) =>
              setForm((p) => ({ ...p, internalNotes: e.target.value }))
            }
            placeholder="Estrategia, observaciones, recordatorios privados..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
