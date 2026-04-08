"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  Receipt,
  Wallet,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HonorariosTabProps {
  caseId: string;
  totalAgreedFee: number;
  payments: any[];
  onRefresh: () => void;
}

export default function HonorariosTab({
  caseId,
  totalAgreedFee,
  payments,
  onRefresh,
}: HonorariosTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "HONORARIO" as "HONORARIO" | "GASTO",
    amount: "",
    concept: "",
    date: new Date().toISOString().split("T")[0],
  });

  const totalHonorarios = payments
    .filter((p) => p.type === "HONORARIO")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalGastos = payments
    .filter((p) => p.type === "GASTO")
    .reduce((sum, p) => sum + p.amount, 0);

  const saldoPendiente = totalAgreedFee - totalHonorarios;

  const handleSave = async () => {
    if (!form.concept.trim() || !form.amount) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          concept: form.concept,
          date: form.date,
        }),
      });
      setForm({
        type: "HONORARIO",
        amount: "",
        concept: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("¿Eliminar este pago?")) return;
    setDeleting(paymentId);
    try {
      await fetch(`/api/cases/${caseId}/payments/${paymentId}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setDeleting(null);
    }
  };

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total pactado</p>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(totalAgreedFee)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">
                Total honorarios pagados
              </p>
            </div>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(totalHonorarios)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-muted-foreground">Total gastos</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {formatCurrency(totalGastos)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`h-5 w-5 ${saldoPendiente > 0 ? "text-red-600" : "text-green-600"}`}
              />
              <p className="text-sm text-muted-foreground">Saldo pendiente</p>
            </div>
            <p
              className={`mt-1 text-2xl font-bold ${saldoPendiente > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {formatCurrency(saldoPendiente)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Botón agregar */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar pago
        </Button>
      )}

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Nuevo pago</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Tipo *</Label>
              <div className="flex gap-2">
                {(["HONORARIO", "GASTO"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((p) => ({ ...p, type }))}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      form.type === type
                        ? type === "HONORARIO"
                          ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500/20"
                          : "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500/20"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {type === "HONORARIO" ? "Honorario" : "Gasto"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Monto *</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Concepto *</Label>
                <Input
                  value={form.concept}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, concept: e.target.value }))
                  }
                  placeholder="Concepto del pago"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Registrar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabla de pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se han registrado pagos.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Concepto</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium text-right">Monto</th>
                    <th className="pb-2 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedPayments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="py-3">
                        {new Date(payment.date).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-3">{payment.concept}</td>
                      <td className="py-3">
                        <Badge
                          className={
                            payment.type === "HONORARIO"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-orange-100 text-orange-800 border-orange-200"
                          }
                        >
                          {payment.type === "HONORARIO"
                            ? "Honorario"
                            : "Gasto"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                          disabled={deleting === payment.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleting === payment.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
