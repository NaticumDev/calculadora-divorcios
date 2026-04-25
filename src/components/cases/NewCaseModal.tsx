"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewCaseModalProps {
  onClose: () => void;
}

type DivorceType = "VOLUNTARIO" | "CONTENCIOSO";
type PropertyRegime = "" | "SOCIEDAD_CONYUGAL" | "SEPARACION_BIENES";

// Defaults de respaldo si la config no carga
const FALLBACK_FEES = {
  voluntary: 25000,
  contested: 50000,
};

export default function NewCaseModal({ onClose }: NewCaseModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Honorarios configurados desde LawyerConfig
  const [voluntaryFee, setVoluntaryFee] = useState(FALLBACK_FEES.voluntary);
  const [contestedFee, setContestedFee] = useState(FALLBACK_FEES.contested);
  const [feesLoaded, setFeesLoaded] = useState(false);

  // Paso 1 — Datos del cliente
  const [client, setClient] = useState({
    fullName: "",
    phone: "",
    email: "",
    curp: "",
    rfc: "",
    occupation: "",
  });

  // Paso 2 — Datos del caso
  const [divorceType, setDivorceType] = useState<DivorceType>("VOLUNTARIO");
  const [propertyRegime, setPropertyRegime] = useState<PropertyRegime>("");
  const [totalAgreedFee, setTotalAgreedFee] = useState<string>("");
  const [estimatedDurationMonths, setEstimatedDurationMonths] = useState<string>("3");
  const [internalNotes, setInternalNotes] = useState("");

  // Cargar honorarios configurados
  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setVoluntaryFee(data.voluntaryDivorceFee ?? FALLBACK_FEES.voluntary);
          setContestedFee(data.contestedDivorceFee ?? FALLBACK_FEES.contested);
          // Inicializar honorarios del caso con el valor del tipo de divorcio actual
          setTotalAgreedFee(
            String(data.voluntaryDivorceFee ?? FALLBACK_FEES.voluntary)
          );
        } else {
          setTotalAgreedFee(String(FALLBACK_FEES.voluntary));
        }
        setFeesLoaded(true);
      })
      .catch(() => {
        setTotalAgreedFee(String(FALLBACK_FEES.voluntary));
        setFeesLoaded(true);
      });
  }, []);

  // Cuando cambia el tipo de divorcio, ajustar honorarios y duración por defecto
  const handleDivorceTypeChange = (type: DivorceType) => {
    setDivorceType(type);
    if (type === "VOLUNTARIO") {
      setTotalAgreedFee(String(voluntaryFee));
      setEstimatedDurationMonths("3");
    } else {
      setTotalAgreedFee(String(contestedFee));
      setEstimatedDurationMonths("12");
    }
  };

  const handleNext = () => {
    if (!client.fullName.trim()) {
      setError("El nombre del cliente es obligatorio");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!client.fullName.trim()) {
      setError("El nombre del cliente es obligatorio");
      setStep(1);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divorceType,
          propertyRegime: propertyRegime || null,
          totalAgreedFee: totalAgreedFee ? Number(totalAgreedFee) : 0,
          estimatedDurationMonths: estimatedDurationMonths
            ? Number(estimatedDurationMonths)
            : null,
          internalNotes: internalNotes || null,
          client: {
            fullName: client.fullName.trim(),
            phone: client.phone || null,
            email: client.email || null,
            curp: client.curp || null,
            rfc: client.rfc || null,
            occupation: client.occupation || null,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `Error ${res.status}`);
      }
      const data = await res.json();
      router.push(`/admin/casos/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el caso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Encabezado con stepper */}
        <div>
          <h2 className="text-xl font-bold">Nuevo caso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Paso {step} de 2 — {step === 1 ? "Datos del cliente" : "Datos del caso"}
          </p>
          <div className="flex gap-2 mt-3">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 1 ? "bg-primary" : "bg-secondary"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 2 ? "bg-primary" : "bg-secondary"
              }`}
            />
          </div>
        </div>

        {/* PASO 1 — Cliente */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Captura los datos básicos de tu cliente. Después podrás
              completar más información en el detalle del caso.
            </p>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                value={client.fullName}
                onChange={(e) =>
                  setClient((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Nombre completo del cliente"
                autoFocus
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={client.phone}
                  onChange={(e) =>
                    setClient((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="999 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={client.email}
                  onChange={(e) =>
                    setClient((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="cliente@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="curp">CURP</Label>
                <Input
                  id="curp"
                  value={client.curp}
                  onChange={(e) =>
                    setClient((p) => ({ ...p, curp: e.target.value.toUpperCase() }))
                  }
                  placeholder="CURP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  value={client.rfc}
                  onChange={(e) =>
                    setClient((p) => ({ ...p, rfc: e.target.value.toUpperCase() }))
                  }
                  placeholder="RFC"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Ocupación</Label>
              <Input
                id="occupation"
                value={client.occupation}
                onChange={(e) =>
                  setClient((p) => ({ ...p, occupation: e.target.value }))
                }
                placeholder="Ocupación o profesión"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 2 — Caso */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Resumen del cliente */}
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{client.fullName}</p>
            </div>

            {/* Tipo de divorcio */}
            <div className="space-y-2">
              <Label>Tipo de divorcio</Label>
              <div className="flex gap-2">
                {(["VOLUNTARIO", "CONTENCIOSO"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleDivorceTypeChange(type)}
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
                {(
                  [
                    { value: "" as PropertyRegime, label: "Por confirmar" },
                    {
                      value: "SOCIEDAD_CONYUGAL" as PropertyRegime,
                      label: "Sociedad conyugal",
                    },
                    {
                      value: "SEPARACION_BIENES" as PropertyRegime,
                      label: "Separación de bienes",
                    },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPropertyRegime(opt.value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fee">Honorarios pactados ($)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={totalAgreedFee}
                  onChange={(e) => setTotalAgreedFee(e.target.value)}
                />
                {feesLoaded && (
                  <p className="text-xs text-muted-foreground">
                    Tarifa base configurada:{" "}
                    {divorceType === "VOLUNTARIO"
                      ? `$${voluntaryFee.toLocaleString("es-MX")}`
                      : `$${contestedFee.toLocaleString("es-MX")}`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración estimada (meses)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={estimatedDurationMonths}
                  onChange={(e) => setEstimatedDurationMonths(e.target.value)}
                />
              </div>
            </div>

            {/* Notas iniciales */}
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
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Crear caso
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
