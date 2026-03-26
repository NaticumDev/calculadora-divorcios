import Link from "next/link";
import { Calculator, Scale, Home, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Scale,
    title: "Pensión Alimenticia",
    description:
      "Calcula la pensión alimenticia basada en el ingreso del obligado, número de hijos y los porcentajes establecidos por la ley en Yucatán.",
  },
  {
    icon: Calculator,
    title: "Pensión Compensatoria",
    description:
      "Estima la pensión compensatoria considerando la duración del matrimonio, la diferencia de ingresos y otros factores relevantes.",
  },
  {
    icon: Home,
    title: "Costos de Vivienda",
    description:
      "Proyecta los costos de vivienda incluyendo renta, depósito, mudanza, mobiliario y servicios básicos para una nueva residencia.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Calculadora Divorcios</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
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

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Calculadora de Costos de Divorcio
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Obtén un estimado detallado de los costos asociados a un proceso
              de divorcio en el estado de Yucatán, México. Incluye pensión
              alimenticia, pensión compensatoria, costos legales y gastos de
              vivienda.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/calculadora"
                className={cn(buttonVariants({ size: "lg" }), "text-base")}
              >
                Comenzar cálculo gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-base"
                )}
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Lo que incluye nuestra calculadora
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold">
              Calcula tus costos de divorcio hoy
            </h2>
            <p className="mt-4 text-muted-foreground">
              Nuestra herramienta te proporciona un estimado detallado en
              minutos. No necesitas cuenta para empezar.
            </p>
            <Link
              href="/calculadora"
              className={cn(buttonVariants({ size: "lg" }), "mt-8 text-base")}
            >
              Iniciar calculadora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">
                Calculadora de Divorcios - Yucatán
              </span>
            </div>
            <p className="max-w-xl">
              Aviso legal: Los cálculos proporcionados por esta herramienta son
              estimados y no constituyen asesoría legal. Los costos reales
              pueden variar según las circunstancias específicas de cada caso.
              Consulte a un abogado para obtener asesoría legal profesional.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
