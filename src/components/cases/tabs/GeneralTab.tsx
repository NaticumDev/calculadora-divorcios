"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  UserPlus,
  Baby,
  Plus,
  Trash2,
  Save,
  Loader2,
  Edit2,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface GeneralTabProps {
  caseData: any;
  onRefresh: () => void;
}

const DIVORCE_TYPE_LABELS: Record<string, string> = {
  VOLUNTARIO: "Voluntario",
  CONTENCIOSO: "Contencioso",
};

const PROPERTY_REGIME_LABELS: Record<string, string> = {
  SOCIEDAD_CONYUGAL: "Sociedad conyugal",
  SEPARACION_BIENES: "Separación de bienes",
};

function PartyCard({
  title,
  icon: Icon,
  party,
  role,
  caseId,
  onRefresh,
}: {
  title: string;
  icon: any;
  party: any;
  role: "client" | "counterpart";
  caseId: string;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(!party);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: party?.fullName || "",
    curp: party?.curp || "",
    rfc: party?.rfc || "",
    address: party?.address || "",
    phone: party?.phone || "",
    email: party?.email || "",
    occupation: party?.occupation || "",
    monthlyIncome: party?.monthlyIncome || "",
    birthDate: party?.birthDate
      ? new Date(party.birthDate).toISOString().split("T")[0]
      : "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName: form.fullName,
          curp: form.curp || null,
          rfc: form.rfc || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          occupation: form.occupation || null,
          monthlyIncome: form.monthlyIncome
            ? Number(form.monthlyIncome)
            : null,
          birthDate: form.birthDate || null,
        }),
      });
      setEditing(false);
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  if (!party && !editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar {role === "client" ? "cliente" : "contraparte"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        {party && !editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        {editing && party && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Nombre completo *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CURP</Label>
                <Input
                  value={form.curp}
                  onChange={(e) => handleChange("curp", e.target.value)}
                  placeholder="CURP"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">RFC</Label>
                <Input
                  value={form.rfc}
                  onChange={(e) => handleChange("rfc", e.target.value)}
                  placeholder="RFC"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Teléfono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ocupación</Label>
                <Input
                  value={form.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder="Ocupación"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ingreso mensual</Label>
                <Input
                  type="number"
                  value={form.monthlyIncome}
                  onChange={(e) =>
                    handleChange("monthlyIncome", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              {party.fullName}
            </div>
            {party.curp && (
              <div>
                <span className="text-muted-foreground">CURP:</span>{" "}
                {party.curp}
              </div>
            )}
            {party.rfc && (
              <div>
                <span className="text-muted-foreground">RFC:</span>{" "}
                {party.rfc}
              </div>
            )}
            {party.phone && (
              <div>
                <span className="text-muted-foreground">Teléfono:</span>{" "}
                {party.phone}
              </div>
            )}
            {party.email && (
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {party.email}
              </div>
            )}
            {party.occupation && (
              <div>
                <span className="text-muted-foreground">Ocupación:</span>{" "}
                {party.occupation}
              </div>
            )}
            {party.monthlyIncome != null && (
              <div>
                <span className="text-muted-foreground">Ingreso:</span>{" "}
                {formatCurrency(party.monthlyIncome)}
              </div>
            )}
            {party.birthDate && (
              <div>
                <span className="text-muted-foreground">Nacimiento:</span>{" "}
                {new Date(party.birthDate).toLocaleDateString("es-MX")}
              </div>
            )}
            {party.address && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Dirección:</span>{" "}
                {party.address}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChildrenSection({
  caseId,
  children,
  onRefresh,
}: {
  caseId: string;
  children: any[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    birthDate: "",
    currentCustody: "",
    desiredCustody: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      fullName: "",
      age: "",
      birthDate: "",
      currentCustody: "",
      desiredCustody: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (child: any) => {
    setForm({
      fullName: child.fullName,
      age: String(child.age),
      birthDate: child.birthDate
        ? new Date(child.birthDate).toISOString().split("T")[0]
        : "",
      currentCustody: child.currentCustody || "",
      desiredCustody: child.desiredCustody || "",
      notes: child.notes || "",
    });
    setEditingId(child.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.age) return;
    setSaving(true);
    try {
      const url = editingId
        ? `/api/cases/${caseId}/children/${editingId}`
        : `/api/cases/${caseId}/children`;
      await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          age: Number(form.age),
          birthDate: form.birthDate || null,
          currentCustody: form.currentCustody || null,
          desiredCustody: form.desiredCustody || null,
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

  const handleDelete = async (childId: string) => {
    if (!confirm("¿Eliminar este hijo del caso?")) return;
    await fetch(`/api/cases/${caseId}/children/${childId}`, {
      method: "DELETE",
    });
    onRefresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Baby className="h-5 w-5" />
          Hijos ({children.length})
        </CardTitle>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Nombre completo *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullName: e.target.value }))
                  }
                  placeholder="Nombre del menor"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Edad *</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: e.target.value }))
                  }
                  placeholder="Edad"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, birthDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Custodia actual</Label>
                <Input
                  value={form.currentCustody}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currentCustody: e.target.value }))
                  }
                  placeholder="Madre / Padre / Compartida"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Custodia deseada</Label>
                <Input
                  value={form.desiredCustody}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, desiredCustody: e.target.value }))
                  }
                  placeholder="Custodia deseada"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notas</Label>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Observaciones"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                {editingId ? "Actualizar" : "Agregar"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {children.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">
            No se han registrado hijos en este caso.
          </p>
        )}

        {children.map((child: any) => (
          <div
            key={child.id}
            className="flex items-start justify-between rounded-lg border p-3"
          >
            <div className="space-y-1 text-sm">
              <p className="font-medium">{child.fullName}</p>
              <p className="text-muted-foreground">
                {child.age} años
                {child.currentCustody &&
                  ` · Custodia: ${child.currentCustody}`}
              </p>
              {child.desiredCustody && (
                <p className="text-muted-foreground">
                  Custodia deseada: {child.desiredCustody}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(child)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(child.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function GeneralTab({ caseData, onRefresh }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      {/* Información del caso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información del caso</CardTitle>
          <CardDescription>Datos generales del expediente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Tipo de divorcio:</span>{" "}
              <Badge variant="secondary">
                {DIVORCE_TYPE_LABELS[caseData.divorceType] ||
                  caseData.divorceType}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Régimen patrimonial:</span>{" "}
              {caseData.propertyRegime
                ? PROPERTY_REGIME_LABELS[caseData.propertyRegime]
                : "Sin especificar"}
            </div>
            <div>
              <span className="text-muted-foreground">Juzgado:</span>{" "}
              {caseData.courtName || "Sin asignar"}
            </div>
            <div>
              <span className="text-muted-foreground">Expediente judicial:</span>{" "}
              {caseData.courtFileNumber || "Sin asignar"}
            </div>
            <div>
              <span className="text-muted-foreground">Abogado contrario:</span>{" "}
              {caseData.opposingLawyer || "Sin especificar"}
            </div>
            <div>
              <span className="text-muted-foreground">Duración estimada:</span>{" "}
              {caseData.estimatedDurationMonths
                ? `${caseData.estimatedDurationMonths} meses`
                : "Sin especificar"}
            </div>
            <div>
              <span className="text-muted-foreground">Fecha de inicio:</span>{" "}
              {new Date(caseData.startDate).toLocaleDateString("es-MX")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cliente y Contraparte */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PartyCard
          title="Cliente"
          icon={User}
          party={caseData.client}
          role="client"
          caseId={caseData.id}
          onRefresh={onRefresh}
        />
        <PartyCard
          title="Contraparte"
          icon={User}
          party={caseData.counterpart}
          role="counterpart"
          caseId={caseData.id}
          onRefresh={onRefresh}
        />
      </div>

      {/* Hijos */}
      <ChildrenSection
        caseId={caseData.id}
        children={caseData.children || []}
        onRefresh={onRefresh}
      />
    </div>
  );
}
