export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cn, formatCurrency } from "@/lib/utils";
import { History, Eye, Calculator } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function HistorialPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const calculations = await prisma.calculation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Cálculos</h1>
        <p className="text-muted-foreground">
          Revisa y consulta tus cálculos de divorcio anteriores.
        </p>
      </div>

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No hay cálculos registrados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aún no has realizado ningún cálculo de divorcio.
            </p>
            <Link href="/dashboard/calculadora" className={cn(buttonVariants(), "mt-6")}>
                <Calculator className="mr-2 h-4 w-4" />
                Nueva calculación
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tus cálculos</CardTitle>
            <CardDescription>
              {calculations.length} calculo
              {calculations.length !== 1 ? "s" : ""} encontrado
              {calculations.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Tipo de divorcio
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Hijos
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Total mensual
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {calculations.map((calc) => (
                    <tr key={calc.id}>
                      <td className="py-3 pr-4">
                        {new Date(calc.createdAt).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            calc.divorceType === "VOLUNTARIO"
                              ? "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                              : "inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800"
                          }
                        >
                          {calc.divorceType === "VOLUNTARIO"
                            ? "Voluntario"
                            : "Contencioso"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{calc.numberOfChildren}</td>
                      <td className="py-3 pr-4 font-medium">
                        {formatCurrency(calc.monthlyTotal)}
                      </td>
                      <td className="py-3">
                        <Link href={`/dashboard/historial/${calc.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
