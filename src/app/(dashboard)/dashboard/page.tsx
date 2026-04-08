"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calculator,
  FolderOpen,
  History,
  ArrowRight,
  Scale,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session } = useSession();

  const isAdmin =
    session?.user && (session.user as { role?: string }).role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {session?.user?.name || "Usuario"}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Gestiona tus casos de divorcio y utiliza la calculadora de costos.
        </p>
      </div>

      {/* Main modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cases module */}
        {isAdmin && (
          <Card className="group relative overflow-hidden border-2 border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-50/50" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-primary/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <CardTitle className="mt-4 text-xl">
                Administración de Casos
              </CardTitle>
              <CardDescription className="text-sm">
                Gestiona expedientes de divorcio, audiencias, bienes, riesgos y
                más.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Scale, label: "Expedientes" },
                  { icon: Users, label: "Partes" },
                  { icon: TrendingUp, label: "Honorarios" },
                  { icon: FileText, label: "Documentos" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
              <Link
                href="/admin/casos"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full text-base"
                )}
              >
                <FolderOpen className="mr-2 h-5 w-5" />
                Ir a Mis Casos
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Calculator module */}
        <Card className="group relative overflow-hidden border-2 border-emerald-200/60 transition-all hover:border-emerald-300 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/30" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <Calculator className="h-6 w-6 text-emerald-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-400/40 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
            </div>
            <CardTitle className="mt-4 text-xl">
              Calculadora de Costos
            </CardTitle>
            <CardDescription className="text-sm">
              Estima los costos de un divorcio: pensiones, vivienda y honorarios.
              Guarda y descarga en PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Scale, label: "Pensiones" },
                { icon: Users, label: "Hijos" },
                { icon: TrendingUp, label: "Proyecciones" },
                { icon: FileText, label: "PDF" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/calculadora"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-emerald-600 text-base hover:bg-emerald-700"
              )}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Abrir Calculadora
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/historial">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="flex items-center gap-3 pt-5 pb-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Historial de cálculos</p>
                <p className="text-xs text-muted-foreground">
                  Revisa cálculos anteriores
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/admin/configuracion">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="flex items-center gap-3 pt-5 pb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Configuración</p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta tarifas y parámetros
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {isAdmin && (
          <Link href="/admin/feedback">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="flex items-center gap-3 pt-5 pb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Retroalimentación</p>
                  <p className="text-xs text-muted-foreground">
                    Ver encuestas recibidas
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
