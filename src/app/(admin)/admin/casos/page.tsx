"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Scale,
  Calendar,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import NewCaseModal from "@/components/cases/NewCaseModal";

const STAGE_LABELS: Record<string, string> = {
  CONSULTA_INICIAL: "Consulta inicial",
  CONTRATO_SERVICIOS: "Contrato de servicios",
  NEGOCIACION: "Negociación",
  DEMANDA: "Demanda",
  PROCESO_JUDICIAL: "Proceso judicial",
  SENTENCIA: "Sentencia",
  EJECUCION: "Ejecución",
  ARCHIVADO: "Archivado",
};

const STAGE_ORDER = [
  "CONSULTA_INICIAL",
  "CONTRATO_SERVICIOS",
  "NEGOCIACION",
  "DEMANDA",
  "PROCESO_JUDICIAL",
  "SENTENCIA",
  "EJECUCION",
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVO: "bg-green-100 text-green-700 border-green-200",
  PAUSADO: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONCLUIDO: "bg-blue-100 text-blue-700 border-blue-200",
  ARCHIVADO: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  CONCLUIDO: "Concluido",
  ARCHIVADO: "Archivado",
};

interface CaseItem {
  id: string;
  caseNumber: string;
  divorceType: string;
  stage: string;
  status: string;
  totalAgreedFee: number;
  estimatedDurationMonths: number | null;
  startDate: string;
  client: { fullName: string } | null;
  counterpart: { fullName: string } | null;
  hearings: { date: string; status: string }[];
}

export default function CasosPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [showNewCase, setShowNewCase] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filtered = cases.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (filterStage !== "ALL" && c.stage !== filterStage) return false;
    if (search) {
      const q = search.toLowerCase();
      const clientName = c.client?.fullName?.toLowerCase() || "";
      const caseNum = c.caseNumber.toLowerCase();
      if (!clientName.includes(q) && !caseNum.includes(q)) return false;
    }
    return true;
  });

  const getStageProgress = (stage: string) => {
    const idx = STAGE_ORDER.indexOf(stage);
    return idx >= 0 ? idx + 1 : 0;
  };

  const getNextHearing = (hearings: { date: string; status: string }[]) => {
    const upcoming = hearings
      .filter((h) => h.status === "PROGRAMADA" && new Date(h.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] || null;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Casos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cases.length} {cases.length === 1 ? "caso" : "casos"} en total
          </p>
        </div>
        <Button onClick={() => setShowNewCase(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo caso
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o número de caso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="ALL">Todos los estatus</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="ALL">Todas las etapas</option>
          {Object.entries(STAGE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Cases grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">
            {cases.length === 0 ? "Aún no hay casos" : "Sin resultados"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {cases.length === 0
              ? "Crea tu primer caso para empezar."
              : "Ajusta los filtros de búsqueda."}
          </p>
          {cases.length === 0 && (
            <Button className="mt-4" onClick={() => setShowNewCase(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear primer caso
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const progress = getStageProgress(c.stage);
            const nextHearing = getNextHearing(c.hearings || []);

            return (
              <Link key={c.id} href={`/admin/casos/${c.id}`}>
                <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="pt-5 pb-4 px-5 space-y-3">
                    {/* Top: case number + status */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {c.caseNumber}
                      </Badge>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          STATUS_COLORS[c.status] || ""
                        }`}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                    </div>

                    {/* Client name */}
                    <div>
                      <p className="font-semibold text-foreground truncate">
                        {c.client?.fullName || "Sin cliente asignado"}
                      </p>
                      {c.counterpart && (
                        <p className="text-xs text-muted-foreground truncate">
                          vs. {c.counterpart.fullName}
                        </p>
                      )}
                    </div>

                    {/* Divorce type badge */}
                    <div className="flex items-center gap-2">
                      <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                      <span
                        className={`text-xs font-medium ${
                          c.divorceType === "VOLUNTARIO"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {c.divorceType === "VOLUNTARIO"
                          ? "Voluntario"
                          : "Contencioso"}
                      </span>
                    </div>

                    {/* Stage */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {STAGE_LABELS[c.stage]}
                        </span>
                        <span className="text-muted-foreground">
                          {progress}/7
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {STAGE_ORDER.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              i < progress ? "bg-primary" : "bg-secondary"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Next hearing */}
                    {nextHearing && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Próxima audiencia:{" "}
                          {new Date(nextHearing.date).toLocaleDateString(
                            "es-MX",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* New case modal */}
      {showNewCase && <NewCaseModal onClose={() => setShowNewCase(false)} />}
    </div>
  );
}
