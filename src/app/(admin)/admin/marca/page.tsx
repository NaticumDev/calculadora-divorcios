"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface BrandingData {
  firmName: string;
  lawyerName: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
}

const defaultBranding: BrandingData = {
  firmName: "",
  lawyerName: "",
  phone: "",
  email: "",
  address: "",
  logoUrl: "",
};

export default function MarcaPage() {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data = await res.json();
          setBranding({
            firmName: data.firmName || "",
            lawyerName: data.lawyerName || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            logoUrl: data.logoUrl || "",
          });
        }
      } catch {
        console.error("Error loading branding");
      } finally {
        setLoading(false);
      }
    }
    loadBranding();
  }, []);

  function updateField(field: keyof BrandingData, value: string) {
    setBranding((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar los cambios.");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error de conexión. Intente de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Marca</h1>
        <p className="text-muted-foreground">
          Personaliza la información de tu despacho que aparecerá en los
          reportes y documentos.
        </p>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
          Cambios guardados exitosamente.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Información del despacho</CardTitle>
                <CardDescription>
                  Datos de contacto y presentación del despacho jurídico
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firmName">Nombre del despacho</Label>
                <Input
                  id="firmName"
                  type="text"
                  placeholder="Ej: Despacho Jurídico García"
                  value={branding.firmName}
                  onChange={(e) => updateField("firmName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lawyerName">Nombre del abogado</Label>
                <Input
                  id="lawyerName"
                  type="text"
                  placeholder="Lic. Juan García López"
                  value={branding.lawyerName}
                  onChange={(e) => updateField("lawyerName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="999 123 4567"
                  value={branding.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contacto@despacho.com"
                  value={branding.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                placeholder="Calle 60 #500, Centro, Mérida, Yucatán"
                value={branding.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logotipo</CardTitle>
            <CardDescription>
              Sube el logotipo de tu despacho para personalizar los reportes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Archivo de logotipo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: PNG, JPG, SVG. Tamaño máximo: 2MB.
              </p>
            </div>
            {branding.logoUrl && (
              <div className="space-y-2">
                <Label>Logo actual</Label>
                <div className="flex h-20 w-40 items-center justify-center rounded-md border bg-muted">
                  <img
                    src={branding.logoUrl}
                    alt="Logo del despacho"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
