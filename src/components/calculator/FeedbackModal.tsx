"use client";

import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SECTIONS = [
  "Pensión alimenticia",
  "Pensión compensatoria",
  "Costos de vivienda",
  "Honorarios legales",
  "Resumen con proyecciones",
];

const RECOMMEND_OPTIONS = ["Sí", "No", "Tal vez"];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-colors"
        >
          <Star
            className={`h-7 w-7 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [mostUsefulSection, setMostUsefulSection] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    easeOfUse > 0 &&
    accuracyRating > 0 &&
    mostUsefulSection &&
    wouldRecommend;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondentName: name || null,
          respondentEmail: email || null,
          easeOfUse,
          accuracyRating,
          mostUsefulSection,
          wouldRecommend,
          additionalComments: comments || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem("feedbackSubmitted", "true");
      } else {
        setError("Error al enviar. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {submitted ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold">
              ¡Gracias por tu retroalimentación!
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu opinión nos ayuda a mejorar esta herramienta.
            </p>
            <Button onClick={onClose} className="mt-4">
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="pr-8">
              <h2 className="text-xl font-bold">
                ¿Qué te pareció la calculadora?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Para continuar revisando tu reporte final completo, es
                importante que contestes esta breve evaluación. Tu opinión nos
                ayuda a mejorar. Toma menos de 2 minutos.
              </p>
            </div>

            {/* Name & email */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Nombre (opcional)</Label>
                <Input
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Correo (opcional)</Label>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Q1: Ease of use */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                1. ¿Qué tan fácil fue usar la calculadora?
              </Label>
              <StarRating value={easeOfUse} onChange={setEaseOfUse} />
              <p className="text-[11px] text-muted-foreground">
                1 = Muy difícil, 5 = Muy fácil
              </p>
            </div>

            {/* Q2: Accuracy */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                2. ¿Los cálculos reflejan la realidad en Yucatán?
              </Label>
              <StarRating value={accuracyRating} onChange={setAccuracyRating} />
              <p className="text-[11px] text-muted-foreground">
                1 = Nada preciso, 5 = Muy preciso
              </p>
            </div>

            {/* Q3: Most useful section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                3. ¿Qué sección consideras más útil?
              </Label>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setMostUsefulSection(section)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      mostUsefulSection === section
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 font-medium"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Would recommend */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                4. ¿Recomendarías esta herramienta?
              </Label>
              <div className="flex gap-2">
                {RECOMMEND_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setWouldRecommend(option)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-all ${
                      wouldRecommend === option
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 font-medium"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Q5: Comments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                5. Comentarios adicionales (opcional)
              </Label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[70px]"
                placeholder="Escribe tus comentarios aquí..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              className="w-full"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  Enviar retroalimentación
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
