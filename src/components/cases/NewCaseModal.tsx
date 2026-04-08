"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewCaseModalProps {
  onClose: () => void;
}

export default function NewCaseModal({ onClose }: NewCaseModalProps) {
  const router = useRouter();
  const [divorceType, setDivorceType] = useState<"VOLUNTARIO" | "CONTENCIOSO">("VOLUNTARIO");
  const [propertyRegime, setPropertyRegime] = useState<"SOCIEDAD_CONYUGAL" | "SEPARACION_BIENES">("SOCIEDAD_CONYUGAL");
  const [totalAgreedFee, setTotalAgreedFee] = useState(15000);
  const [estimatedDurationMonths, setEstimatedDurationMonths] = useState(3);
  const [internalNotes, setInternalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divorceType,
          propertyRegime,
          totalAgreedFee,
          estimatedDurationMonths,
          internalNotes: internalNotes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el caso");
      }
      const data = await res.json();
      router.push(`/admin/casos/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold">Nuevo caso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Completa la información inicial del caso.
          </p>
        </div>

        {/* Tipo de divorcio */}
        <div className="space-y-2">
          <Label>Tipo de divorcio</Label>
          <div className="flex gap-2">
            {(["VOLUNTARIO", "CONTENCIOSO"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setDivorceType(type);
                  if (type === "VOLUNTARIO") {
                    setEstimatedDurationMonths(3);
                    setTotalAgreedFee(15000);
                  } else {
                    setEstimatedDurationMonths(12);
                    setTotalAgreedFee(35000);
                  }
                }}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  divorceType === type
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

        {/* Régimen patrimonial */}
        <div className="space-y-2">
          <Label>Régimen patrimonial</Label>
          <div className="flex gap-2">
            {([
              { value: "SOCIEDAD_CONYUGAL", label: "Sociedad conyugal" },
              { value: "SEPARACION_BIENES", label: "Separación de bienes" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPropertyRegime(opt.value)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  propertyRegime === opt.value
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Honorarios y duración */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fee">Honorarios pactados ($)</Label>
            <Input
              id="fee"
              type="number"
              value={totalAgreedFee}
              onChange={(e) => setTotalAgreedFee(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duración estimada (meses)</Label>
            <Input
              id="duration"
              type="number"
              value={estimatedDurationMonths}
              onChange={(e) => setEstimatedDurationMonths(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas iniciales (opcional)</Label>
          <textarea
            id="notes"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
            placeholder="Contexto del caso, observaciones iniciales..."
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear caso"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
