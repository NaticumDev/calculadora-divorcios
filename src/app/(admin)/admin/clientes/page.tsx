export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function ClientesPage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      _count: {
        select: { calculations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">
          Lista de usuarios registrados en la plataforma.
        </p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No hay clientes registrados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los clientes aparecerán aquí cuando se registren.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clientes registrados</CardTitle>
            <CardDescription>
              {clients.length} cliente{clients.length !== 1 ? "s" : ""}{" "}
              registrado{clients.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Correo electrónico
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Cálculos
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Fecha de registro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="py-3 pr-4 font-medium">{client.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {client.email}
                      </td>
                      <td className="py-3 pr-4">
                        {client._count.calculations}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString(
                          "es-MX",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
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
