"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
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
      } else {
        setError("Error al enviar. Intente de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">¡Gracias por tu retroalimentación!</h2>
            <p className="text-muted-foreground">
              Tu opinión nos ayuda a mejorar esta herramienta para todos los
              profesionales del derecho familiar en Yucatán.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/calculadora">
                <Button className="w-full">Ir a la calculadora</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Encuesta de retroalimentación
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tu opinión como profesional del derecho es muy valiosa para mejorar
            esta herramienta. La encuesta toma menos de 2 minutos.
          </p>
        </div>

        {/* Datos opcionales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del participante</CardTitle>
            <CardDescription>Opcional - puedes responder de forma anónima</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pregunta 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              1. ¿Qué tan fácil fue usar la calculadora?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StarRating
              value={easeOfUse}
              onChange={setEaseOfUse}
              label="1 = Muy difícil, 5 = Muy fácil"
            />
          </CardContent>
        </Card>

        {/* Pregunta 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              2. ¿Los conceptos y cálculos reflejan la realidad de los divorcios
              en Yucatán?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StarRating
              value={accuracyRating}
              onChange={setAccuracyRating}
              label="1 = Nada preciso, 5 = Muy preciso"
            />
          </CardContent>
        </Card>

        {/* Pregunta 3 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              3. ¿Qué sección de la calculadora consideras más útil?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {SECTIONS.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setMostUsefulSection(section)}
                  className={`rounded-lg border p-3 text-left text-sm transition-all ${
                    mostUsefulSection === section
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 font-medium"
                      : "hover:border-primary/40"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pregunta 4 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              4. ¿Recomendarías esta herramienta a otros abogados?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {RECOMMEND_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWouldRecommend(option)}
                  className={`flex-1 rounded-lg border p-3 text-center text-sm transition-all ${
                    wouldRecommend === option
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 font-medium"
                      : "hover:border-primary/40"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pregunta 5 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              5. ¿Tienes algún comentario o sugerencia adicional?
            </CardTitle>
            <CardDescription>Opcional</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
              placeholder="Escribe tus comentarios aquí..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          size="lg"
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
      </main>
    </div>
  );
}
