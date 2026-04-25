"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  Gavel,
  AlertTriangle,
  Clock,
  Loader2,
  ArrowRight,
  FolderClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgendaData {
  upcomingHearings: any[];
  overdueTasks: any[];
  upcomingTasks: any[];
  staleCases: any[];
  generatedAt: string;
}

const STAGE_LABELS: Record<string, string> = {
  CONSULTA_INICIAL: "Consulta inicial",
  CONTRATO_SERVICIOS: "Contrato",
  NEGOCIACION: "Negociación",
  DEMANDA: "Demanda",
  PROCESO_JUDICIAL: "Proceso judicial",
  SENTENCIA: "Sentencia",
  EJECUCION: "Ejecución",
};

const PRIORITY_BADGE: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-green-100 text-green-800 border-green-200",
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Alta",
  2: "Media",
  3: "Baja",
};

function daysFromNow(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRelativeDay(days: number): string {
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days === -1) return "Ayer";
  if (days < 0) return `hace ${Math.abs(days)} días`;
  return `en ${days} días`;
}

export default function AgendaPage() {
  const [data, setData] = useState<AgendaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agenda")
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar la agenda");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || "No se pudo cargar la agenda"}
      </div>
    );
  }

  const todayHearings = data.upcomingHearings.filter(
    (h: any) => daysFromNow(h.date) === 0
  );
  const weekHearings = data.upcomingHearings.filter((h: any) => {
    const d = daysFromNow(h.date);
    return d > 0 && d <= 7;
  });
  const laterHearings = data.upcomingHearings.filter(
    (h: any) => daysFromNow(h.date) > 7
  );

  const totalUrgent =
    todayHearings.length + data.overdueTasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vista operativa: tus pendientes y citas próximas en todos los casos.
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={todayHearings.length > 0 ? "border-blue-300" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">Audiencias hoy</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {todayHearings.length}
            </p>
          </CardContent>
        </Card>
        <Card className={weekHearings.length > 0 ? "border-indigo-200" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <p className="text-sm text-muted-foreground">Esta semana</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {weekHearings.length}
            </p>
          </CardContent>
        </Card>
        <Card className={data.overdueTasks.length > 0 ? "border-red-300" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-muted-foreground">Tareas vencidas</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {data.overdueTasks.length}
            </p>
          </CardContent>
        </Card>
        <Card className={data.upcomingTasks.length > 0 ? "border-yellow-200" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-muted-foreground">
                Tareas próximas (7 días)
              </p>
            </div>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {data.upcomingTasks.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hoy + esta semana - audiencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gavel className="h-5 w-5" />
            Audiencias próximas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.upcomingHearings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay audiencias programadas en los próximos 30 días.
            </p>
          ) : (
            <div className="space-y-2">
              {data.upcomingHearings.map((h: any) => {
                const days = daysFromNow(h.date);
                const isToday = days === 0;
                const isSoon = days >= 0 && days <= 3;
                return (
                  <Link
                    key={h.id}
                    href={`/admin/casos/${h.case.id}`}
                    className="block"
                  >
                    <div
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-all hover:border-primary/40 ${
                        isToday
                          ? "border-blue-300 bg-blue-50"
                          : isSoon
                          ? "border-amber-200 bg-amber-50/50"
                          : ""
                      }`}
                    >
                      <div className="shrink-0 text-center w-14">
                        <p
                          className={`text-2xl font-bold leading-none ${
                            isToday ? "text-blue-700" : ""
                          }`}
                        >
                          {new Date(h.date).getDate()}
                        </p>
                        <p className="text-xs uppercase text-muted-foreground">
                          {new Date(h.date).toLocaleDateString("es-MX", {
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {h.case.caseNumber}
                          </Badge>
                          <span className="text-sm font-medium">
                            {h.case.client?.fullName || "Sin cliente"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {h.type}
                          {h.time && ` · ${h.time}`}
                          {h.courtName && ` · ${h.courtName}`}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isToday
                              ? "text-blue-700 font-semibold"
                              : isSoon
                              ? "text-amber-700 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="inline h-3 w-3 mr-1" />
                          {formatRelativeDay(days)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tareas vencidas */}
      {data.overdueTasks.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Tareas vencidas ({data.overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.overdueTasks.map((t: any) => {
                const days = daysFromNow(t.dueDate);
                return (
                  <Link
                    key={t.id}
                    href={`/admin/casos/${t.case.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3 hover:border-red-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {t.case.caseNumber}
                          </Badge>
                          <span className="text-sm font-medium">
                            {t.case.client?.fullName || "Sin cliente"}
                          </span>
                          <Badge className={PRIORITY_BADGE[t.priority] || ""}>
                            {PRIORITY_LABELS[t.priority] || "Media"}
                          </Badge>
                        </div>
                        <p className="text-sm mt-0.5">{t.title}</p>
                        <p className="text-xs text-red-600 font-medium mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Vencida {formatRelativeDay(days)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tareas próximas */}
      {data.upcomingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-5 w-5" />
              Tareas próximas (próximos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.upcomingTasks.map((t: any) => {
                const days = daysFromNow(t.dueDate);
                return (
                  <Link
                    key={t.id}
                    href={`/admin/casos/${t.case.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3 rounded-lg border p-3 hover:border-primary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {t.case.caseNumber}
                          </Badge>
                          <span className="text-sm font-medium">
                            {t.case.client?.fullName || "Sin cliente"}
                          </span>
                          <Badge className={PRIORITY_BADGE[t.priority] || ""}>
                            {PRIORITY_LABELS[t.priority] || "Media"}
                          </Badge>
                        </div>
                        <p className="text-sm mt-0.5">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Vence {formatRelativeDay(days)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Casos sin actualizar */}
      {data.staleCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderClock className="h-5 w-5" />
              Casos sin actualizar (más de 30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.staleCases.map((c: any) => {
                const days = daysFromNow(c.updatedAt);
                return (
                  <Link
                    key={c.id}
                    href={`/admin/casos/${c.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3 rounded-lg border p-3 hover:border-primary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {c.caseNumber}
                          </Badge>
                          <span className="text-sm font-medium truncate">
                            {c.client?.fullName || "Sin cliente"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {STAGE_LABELS[c.stage] || c.stage} · sin actividad{" "}
                          {formatRelativeDay(days)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío total */}
      {totalUrgent === 0 &&
        data.upcomingTasks.length === 0 &&
        data.upcomingHearings.length === 0 &&
        data.staleCases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Todo al día</p>
              <p className="text-sm mt-1">
                No tienes audiencias próximas, tareas pendientes ni casos sin
                actualizar.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
