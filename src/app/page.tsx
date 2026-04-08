import Link from "next/link";
import {
  Calculator,
  Scale,
  Home,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-primary">Naticum</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" })
              )}
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Iniciar sesión
            </Link>
            <Link
              href="/calculadora"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Calcular ahora
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Calculadora de Costos
              <span className="block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                de Divorcio — Yucatán
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              En <strong className="text-foreground">Naticum</strong> estamos
              convencidos de que la tecnología puede simplificar y hacer más
              accesibles los procesos legales. Ponemos a tu disposición una
              herramienta que te permite estimar los costos totales de un
              divorcio en Yucatán.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/calculadora"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group h-14 px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                )}
              >
                Comenzar cálculo gratuito
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-14 px-8 text-base"
                )}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar sesión
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No necesitas crear cuenta para calcular. Inicia sesión para
              guardar tus cálculos y descargar reportes en PDF.
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

        {/* What you get */}
        <section className="py-8">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="text-base">
                Obtén un resumen con el{" "}
                <strong className="text-foreground">costo mensual</strong>,{" "}
                <strong className="text-foreground">anual</strong> y una{" "}
                <strong className="text-foreground">
                  proyección a futuro
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4">
            <Card className="border-slate-200 bg-slate-50/80">
              <CardContent className="pt-6 pb-5 px-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Aviso legal
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Esta herramienta proporciona estimaciones con fines
                  informativos y educativos únicamente. Los montos calculados
                  son aproximaciones basadas en criterios generales de la
                  práctica judicial en Yucatán y en el Código de Familia para
                  el Estado de Yucatán, y no constituyen asesoría legal,
                  financiera ni profesional de ningún tipo.
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {[
                    "Los resultados son aproximaciones referenciales, no garantías ni compromisos",
                    "Ningún resultado sustituye la consulta con un abogado especializado",
                    "La información que ingreses se utiliza exclusivamente para generar el cálculo",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
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
