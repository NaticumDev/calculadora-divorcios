"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  User,
  Briefcase,
  DollarSign,
  Gavel,
  ShieldAlert,
  CheckSquare,
  MessageSquare,
  FileText,
} from "lucide-react";

import GeneralTab from "@/components/cases/tabs/GeneralTab";
import PatrimonioTab from "@/components/cases/tabs/PatrimonioTab";
import HonorariosTab from "@/components/cases/tabs/HonorariosTab";
import AudienciasTab from "@/components/cases/tabs/AudienciasTab";
import RiesgosTab from "@/components/cases/tabs/RiesgosTab";
import TareasTab from "@/components/cases/tabs/TareasTab";
import NotasTab from "@/components/cases/tabs/NotasTab";
import DocumentosTab from "@/components/cases/tabs/DocumentosTab";

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

const STAGES = [
  "CONSULTA_INICIAL",
  "CONTRATO_SERVICIOS",
  "NEGOCIACION",
  "DEMANDA",
  "PROCESO_JUDICIAL",
  "SENTENCIA",
  "EJECUCION",
  "ARCHIVADO",
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  CONCLUIDO: "Concluido",
  ARCHIVADO: "Archivado",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVO: "bg-green-100 text-green-800 border-green-200",
  PAUSADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONCLUIDO: "bg-blue-100 text-blue-800 border-blue-200",
  ARCHIVADO: "bg-gray-100 text-gray-800 border-gray-200",
};

const STAGE_STYLES: Record<string, string> = {
  CONSULTA_INICIAL: "bg-slate-100 text-slate-800 border-slate-200",
  CONTRATO_SERVICIOS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  NEGOCIACION: "bg-amber-100 text-amber-800 border-amber-200",
  DEMANDA: "bg-orange-100 text-orange-800 border-orange-200",
  PROCESO_JUDICIAL: "bg-red-100 text-red-800 border-red-200",
  SENTENCIA: "bg-purple-100 text-purple-800 border-purple-200",
  EJECUCION: "bg-teal-100 text-teal-800 border-teal-200",
  ARCHIVADO: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUSES = ["ACTIVO", "PAUSADO", "CONCLUIDO", "ARCHIVADO"];

const TABS = [
  { key: "general", label: "General", icon: User },
  { key: "patrimonio", label: "Patrimonio", icon: Briefcase },
  { key: "honorarios", label: "Honorarios", icon: DollarSign },
  { key: "audiencias", label: "Audiencias", icon: Gavel },
  { key: "riesgos", label: "Riesgos", icon: ShieldAlert },
  { key: "tareas", label: "Tareas", icon: CheckSquare },
  { key: "notas", label: "Notas", icon: MessageSquare },
  { key: "documentos", label: "Documentos", icon: FileText },
];

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [updatingStage, setUpdatingStage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCase = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (!res.ok) throw new Error("Error al cargar el caso");
      const data = await res.json();
      setCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleStageChange = async (newStage: string) => {
    setUpdatingStage(true);
    try {
      await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      fetchCase();
    } catch {
      // error silenciado
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCase();
    } catch {
      // error silenciado
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-600">{error || "Caso no encontrado"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/casos")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a casos
        </Button>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(caseData.stage);
  const progressPercent =
    STAGES.length > 1
      ? ((currentStageIndex + 1) / STAGES.length) * 100
      : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/casos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a casos
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{caseData.caseNumber}</h1>
          {caseData.client && (
            <span className="text-lg text-muted-foreground">
              &mdash; {caseData.client.fullName}
            </span>
          )}
          <Badge className={STATUS_STYLES[caseData.status] || ""}>
            {STATUS_LABELS[caseData.status] || caseData.status}
          </Badge>
          <Badge className={STAGE_STYLES[caseData.stage] || ""}>
            {STAGE_LABELS[caseData.stage] || caseData.stage}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {STAGES.map((stage, i) => (
              <span
                key={stage}
                className={`hidden sm:block ${
                  i <= currentStageIndex ? "text-primary font-medium" : ""
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
            ))}
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground sm:hidden">
            Etapa {currentStageIndex + 1} de {STAGES.length}:{" "}
            {STAGE_LABELS[caseData.stage]}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Etapa:
            </label>
            <select
              value={caseData.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={updatingStage}
              className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
            {updatingStage && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Estado:
            </label>
            <select
              value={caseData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {updatingStatus && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-1 overflow-x-auto -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "general" && (
          <GeneralTab caseData={caseData} onRefresh={fetchCase} />
        )}
        {activeTab === "patrimonio" && (
          <PatrimonioTab
            caseId={id}
            assets={caseData.assets || []}
            onRefresh={fetchCase}
          />
        )}
        {activeTab === "honorarios" && (
          <HonorariosTab
            caseId={id}
            totalAgreedFee={caseData.totalAgreedFee || 0}
            payments={caseData.payments || []}
            onRefresh={fetchCase}
          />
        )}
        {activeTab === "audiencias" && (
          <AudienciasTab
            caseId={id}
            hearings={caseData.hearings || []}
            onRefresh={fetchCase}
          />
        )}
        {activeTab === "riesgos" && (
          <RiesgosTab
            caseId={id}
            risks={caseData.risks || []}
            onRefresh={fetchCase}
          />
        )}
        {activeTab === "tareas" && (
          <TareasTab
            caseId={id}
            tasks={caseData.tasks || []}
            onRefresh={fetchCase}
          />
        )}
        {activeTab === "notas" && (
          <NotasTab
            caseId={id}
            notes={caseData.notes || []}
            onRefresh={fetchCase}
          />
        )}
        {activeTab === "documentos" && (
          <DocumentosTab
            caseId={id}
            documents={caseData.documents || []}
          />
        )}
      </div>
    </div>
  );
}
