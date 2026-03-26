export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Users, Calculator, Settings, Palette } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [totalClients, totalCalculations] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.calculation.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="mt-1 text-muted-foreground">
          Vista general del sistema y accesos rápidos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cálculos
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalculations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Accesos rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Configuración</CardTitle>
                  <CardDescription>
                    Ajusta tarifas, porcentajes y costos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/configuracion" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Ir a configuración
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Clientes</CardTitle>
                  <CardDescription>
                    Administra los usuarios registrados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/clientes" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Ver clientes
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Marca</CardTitle>
                  <CardDescription>
                    Personaliza la información del despacho
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/marca" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Configurar marca
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
