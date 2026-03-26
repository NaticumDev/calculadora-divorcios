"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calculator, History, FileText } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {session?.user?.name || "Usuario"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona tus cálculos de divorcio y accede a tus herramientas.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Nueva Calculación</CardTitle>
              <CardDescription>
                Inicia un nuevo cálculo de divorcio
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/calculadora" className={cn(buttonVariants(), "w-full")}>
              Calcular
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Ver Historial</CardTitle>
              <CardDescription>
                Revisa tus cálculos anteriores
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/historial" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Ver historial
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Mi Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/perfil" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Editar perfil
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Cálculos recientes</CardTitle>
          <CardDescription>
            Tus últimos cálculos de costo de divorcio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No hay cálculos recientes.
            </p>
            <p className="text-sm text-muted-foreground">
              Inicia tu primer cálculo para verlo aquí.
            </p>
            <Link href="/dashboard/calculadora" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              Nueva calculación
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
