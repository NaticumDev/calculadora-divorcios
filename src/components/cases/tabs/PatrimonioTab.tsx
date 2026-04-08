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
  Home,
  Car,
  Landmark,
  TrendingUp,
  Building2,
  CreditCard,
  Package,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PatrimonioTabProps {
  caseId: string;
  assets: any[];
  onRefresh: () => void;
}

const ASSET_TYPES = [
  { value: "INMUEBLE", label: "Inmueble", icon: Home },
  { value: "VEHICULO", label: "Vehículo", icon: Car },
  { value: "CUENTA_BANCARIA", label: "Cuenta bancaria", icon: Landmark },
  { value: "INVERSION", label: "Inversión", icon: TrendingUp },
  { value: "EMPRESA", label: "Empresa", icon: Building2 },
  { value: "DEUDA", label: "Deuda", icon: CreditCard },
  { value: "OTRO", label: "Otro", icon: Package },
] as const;

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ASSET_TYPES.map((t) => [t.value, t.label])
);

const TYPE_ICONS: Record<string, any> = Object.fromEntries(
  ASSET_TYPES.map((t) => [t.value, t.icon])
);

export default function PatrimonioTab({
  caseId,
  assets,
  onRefresh,
}: PatrimonioTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "INMUEBLE",
    description: "",
    ownerName: "",
    estimatedValue: "",
    propertyAddress: "",
    deedNumber: "",
    companyName: "",
    companyRfc: "",
    ownershipPercentage: "",
    roleInCompany: "",
    debtBalance: "",
    creditorName: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      type: "INMUEBLE",
      description: "",
      ownerName: "",
      estimatedValue: "",
      propertyAddress: "",
      deedNumber: "",
      companyName: "",
      companyRfc: "",
      ownershipPercentage: "",
      roleInCompany: "",
      debtBalance: "",
      creditorName: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.description.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          description: form.description,
          ownerName: form.ownerName || null,
          estimatedValue: form.estimatedValue
            ? Number(form.estimatedValue)
            : null,
          propertyAddress: form.propertyAddress || null,
          deedNumber: form.deedNumber || null,
          companyName: form.companyName || null,
          companyRfc: form.companyRfc || null,
          ownershipPercentage: form.ownershipPercentage
            ? Number(form.ownershipPercentage)
            : null,
          roleInCompany: form.roleInCompany || null,
          debtBalance: form.debtBalance ? Number(form.debtBalance) : null,
          creditorName: form.creditorName || null,
          notes: form.notes || null,
        }),
      });
      resetForm();
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("¿Eliminar este bien/activo?")) return;
    setDeleting(assetId);
    try {
      await fetch(`/api/cases/${caseId}/assets/${assetId}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setDeleting(null);
    }
  };

  // Agrupar bienes por tipo
  const grouped = ASSET_TYPES.map((t) => ({
    ...t,
    items: assets.filter((a) => a.type === t.value),
  })).filter((g) => g.items.length > 0);

  const totalValue = assets.reduce(
    (sum, a) => sum + (a.estimatedValue || 0),
    0
  );
  const totalDebt = assets
    .filter((a) => a.type === "DEUDA")
    .reduce((sum, a) => sum + (a.debtBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total bienes</p>
            <p className="text-2xl font-bold">{assets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Valor estimado</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total deudas</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDebt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Botón agregar */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar bien o activo
        </Button>
      )}

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Nuevo bien o activo</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de tipo */}
            <div className="space-y-2">
              <Label className="text-xs">Tipo *</Label>
              <div className="flex flex-wrap gap-2">
                {ASSET_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() =>
                      setForm((p) => ({ ...p, type: t.value }))
                    }
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      form.type === t.value
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                        : "hover:border-primary/40"
                    }`}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Descripción *</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Descripción del bien"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">A nombre de</Label>
                <Input
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ownerName: e.target.value }))
                  }
                  placeholder="Propietario registrado"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor estimado</Label>
                <Input
                  type="number"
                  value={form.estimatedValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      estimatedValue: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              {/* Campos según tipo */}
              {form.type === "INMUEBLE" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Dirección del inmueble</Label>
                    <Input
                      value={form.propertyAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          propertyAddress: e.target.value,
                        }))
                      }
                      placeholder="Dirección"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Número de escritura</Label>
                    <Input
                      value={form.deedNumber}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          deedNumber: e.target.value,
                        }))
                      }
                      placeholder="No. escritura"
                    />
                  </div>
                </>
              )}

              {form.type === "EMPRESA" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre de la empresa</Label>
                    <Input
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          companyName: e.target.value,
                        }))
                      }
                      placeholder="Razón social"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">RFC empresa</Label>
                    <Input
                      value={form.companyRfc}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          companyRfc: e.target.value,
                        }))
                      }
                      placeholder="RFC"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Porcentaje de participación
                    </Label>
                    <Input
                      type="number"
                      value={form.ownershipPercentage}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          ownershipPercentage: e.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rol en la empresa</Label>
                    <Input
                      value={form.roleInCompany}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          roleInCompany: e.target.value,
                        }))
                      }
                      placeholder="Socio, Administrador, etc."
                    />
                  </div>
                </>
              )}

              {form.type === "DEUDA" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Saldo de la deuda</Label>
                    <Input
                      type="number"
                      value={form.debtBalance}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          debtBalance: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Acreedor</Label>
                    <Input
                      value={form.creditorName}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          creditorName: e.target.value,
                        }))
                      }
                      placeholder="Nombre del acreedor"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notas</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Observaciones adicionales"
              />
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Agregar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bienes agrupados por tipo */}
      {grouped.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se han registrado bienes o activos en este caso.
          </CardContent>
        </Card>
      )}

      {grouped.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.value} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Icon className="h-4 w-4" />
              {group.label} ({group.items.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((asset: any) => (
                <Card key={asset.id}>
                  <CardContent className="pt-5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {asset.description}
                        </p>
                        {asset.ownerName && (
                          <p className="text-xs text-muted-foreground">
                            A nombre de: {asset.ownerName}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(asset.id)}
                        disabled={deleting === asset.id}
                        className="text-red-600 hover:text-red-700 -mt-1 -mr-2"
                      >
                        {deleting === asset.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    {asset.estimatedValue != null && (
                      <p className="text-lg font-bold">
                        {formatCurrency(asset.estimatedValue)}
                      </p>
                    )}

                    {/* Campos específicos */}
                    {asset.type === "INMUEBLE" && asset.propertyAddress && (
                      <p className="text-xs text-muted-foreground">
                        {asset.propertyAddress}
                      </p>
                    )}
                    {asset.type === "EMPRESA" && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {asset.companyName && <p>{asset.companyName}</p>}
                        {asset.ownershipPercentage != null && (
                          <p>Participación: {asset.ownershipPercentage}%</p>
                        )}
                      </div>
                    )}
                    {asset.type === "DEUDA" && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {asset.debtBalance != null && (
                          <p className="text-red-600 font-medium">
                            Saldo: {formatCurrency(asset.debtBalance)}
                          </p>
                        )}
                        {asset.creditorName && (
                          <p>Acreedor: {asset.creditorName}</p>
                        )}
                      </div>
                    )}

                    {asset.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        {asset.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
