"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Scale,
  Home,
  FileText,
  Shield,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const features = [
  {
    icon: Scale,
    title: "Pensión alimenticia",
    desc: "Conforme al Código de Familia del Estado de Yucatán",
    color: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: Users,
    title: "Pensión compensatoria",
    desc: "Para el cónyuge que lo requiera",
    color: "from-indigo-500/20 to-indigo-600/5",
  },
  {
    icon: Home,
    title: "Costos de vivienda",
    desc: "Renta, depósito, mudanza, mobiliario y servicios",
    color: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    icon: FileText,
    title: "Honorarios legales",
    desc: "Según tipo de divorcio: voluntario o contencioso",
    color: "from-amber-500/20 to-amber-600/5",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already accepted
    const wasAccepted = localStorage.getItem("disclaimerAccepted");
    if (wasAccepted) setAccepted(true);

    // Check calculation limit
    fetch("/api/calculations/count")
      .then((r) => r.json())
      .then((data) => {
        if (data.limitReached) setLimitReached(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setAccepted(true);
    router.push("/calculadora");
  };

  const handleContinue = () => {
    if (limitReached) return;
    if (accepted) {
      router.push("/calculadora");
    } else {
      setDisclaimerOpen(true);
      setTimeout(() => {
        document
          .getElementById("disclaimer")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-primary">Naticum</span>
              <span className="block text-[10px] text-muted-foreground">
                Prueba piloto
              </span>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" />
              Etapa de prueba
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Calculadora de Costos
              <span className="block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                de Divorcio — Yucatán
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              En <strong className="text-foreground">Naticum</strong> estamos
              convencidos de que la tecnología puede simplificar y hacer más
              accesibles los procesos legales. Ponemos a tu disposición, en una
              etapa de prueba, una herramienta que te permite estimar los costos
              totales de un divorcio en Yucatán.
            </p>
          </div>
        </section>

        {/* Features grid */}
        <section className="pb-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group relative overflow-hidden border-0 shadow-sm transition-all hover:shadow-md"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-60`}
                  />
                  <CardContent className="relative pt-6 pb-5 px-5">
                    <f.icon className="mb-3 h-8 w-8 text-primary/80" />
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Result preview */}
        <section className="py-8">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <p className="text-muted-foreground">
              Al finalizar obtendrás un resumen con el{" "}
              <strong className="text-foreground">costo mensual</strong>,{" "}
              <strong className="text-foreground">anual</strong> y una{" "}
              <strong className="text-foreground">proyección a futuro</strong>.
            </p>
          </div>
        </section>

        {/* Pilot notice */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
              <CardContent className="flex items-start gap-4 pt-6 pb-5 px-6">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Esta es una prueba piloto
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Queremos conocer tu opinión para saber si la herramienta
                    refleja la realidad de los procesos de divorcio en Yucatán y
                    si resulta útil en la práctica profesional. Al terminar tu
                    cálculo te pediremos unos minutos para responder una breve
                    encuesta. Tu retroalimentación es fundamental para ajustar,
                    corregir y mejorar esta herramienta antes de su lanzamiento
                    oficial.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA / Limit reached */}
        <section className="py-10">
          <div className="mx-auto max-w-lg px-4 text-center">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : limitReached ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6 pb-5 space-y-3">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-amber-500" />
                  <h3 className="text-lg font-bold text-amber-800">
                    La prueba piloto ha concluido
                  </h3>
                  <p className="text-sm text-amber-700">
                    Hemos alcanzado el límite de cálculos para esta etapa de
                    prueba. Agradecemos a todos los participantes por su valiosa
                    retroalimentación. Estamos trabajando en la versión final de
                    la herramienta.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Button
                  size="lg"
                  className="group h-14 px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  onClick={handleContinue}
                >
                  Comenzar cálculo gratuito
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  No necesitas crear cuenta. Tus datos no se guardan.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Disclaimer accordion */}
        {!limitReached && (
          <section id="disclaimer" className="pb-16">
            <div className="mx-auto max-w-3xl px-4">
              <button
                onClick={() => setDisclaimerOpen(!disclaimerOpen)}
                className="flex w-full items-center justify-between rounded-xl border bg-white px-6 py-4 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Aviso legal importante
                  </span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                    disclaimerOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  disclaimerOpen
                    ? "mt-2 max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Esta herramienta proporciona{" "}
                    <strong className="text-foreground">
                      estimaciones con fines informativos y educativos
                      únicamente
                    </strong>
                    . Los montos calculados son aproximaciones basadas en
                    criterios generales de la práctica judicial en Yucatán y en
                    el Código de Familia para el Estado de Yucatán, y{" "}
                    <strong className="text-foreground">
                      no constituyen asesoría legal, financiera ni profesional
                      de ningún tipo
                    </strong>
                    .
                  </p>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Los montos reales son determinados exclusivamente por la
                    autoridad judicial competente, considerando las
                    circunstancias particulares de cada caso. Factores como
                    acuerdos entre las partes, criterio del juez, pruebas
                    presentadas y condiciones específicas pueden modificar
                    sustancialmente los resultados.
                  </p>

                  <div className="text-sm leading-relaxed text-muted-foreground">
                    <p className="mb-2 font-medium text-foreground">
                      Al utilizar esta herramienta, aceptas que:
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Los resultados son aproximaciones referenciales, no garantías ni compromisos",
                        "Ningún resultado sustituye la consulta con un abogado especializado en derecho familiar",
                        "El desarrollador y operador de esta herramienta no se hace responsable de decisiones tomadas con base en estos cálculos",
                        "La información que ingreses se utiliza exclusivamente para generar el cálculo y no será compartida con terceros",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3">
                    <Button
                      size="lg"
                      className="w-full text-base font-semibold"
                      onClick={handleAccept}
                    >
                      Acepto y quiero continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calculator className="h-4 w-4" />
            <span>Naticum &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
