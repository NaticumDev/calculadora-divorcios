/**
 * Reglas de etapas del caso.
 *
 * Define:
 * - Prerequisitos sugeridos por etapa (validación informativa, NO bloqueante)
 * - Plantillas de tareas comunes que se sugieren al entrar a una etapa
 *
 * Las validaciones son intencionalmente permisivas: solo avisan,
 * nunca impiden cambiar de etapa.
 */

export type CaseStage =
  | "CONSULTA_INICIAL"
  | "CONTRATO_SERVICIOS"
  | "NEGOCIACION"
  | "DEMANDA"
  | "PROCESO_JUDICIAL"
  | "SENTENCIA"
  | "EJECUCION";

export const STAGE_LABELS: Record<CaseStage, string> = {
  CONSULTA_INICIAL: "Consulta inicial",
  CONTRATO_SERVICIOS: "Contrato de servicios",
  NEGOCIACION: "Negociación",
  DEMANDA: "Demanda",
  PROCESO_JUDICIAL: "Proceso judicial",
  SENTENCIA: "Sentencia",
  EJECUCION: "Ejecución",
};

export const STAGE_ORDER: CaseStage[] = [
  "CONSULTA_INICIAL",
  "CONTRATO_SERVICIOS",
  "NEGOCIACION",
  "DEMANDA",
  "PROCESO_JUDICIAL",
  "SENTENCIA",
  "EJECUCION",
];

/**
 * Datos del caso necesarios para validar prerequisitos.
 */
export interface CaseLike {
  client?: { fullName: string } | null;
  counterpart?: { fullName: string } | null;
  divorceType?: string;
  totalAgreedFee?: number | null;
  courtName?: string | null;
  courtFileNumber?: string | null;
  hearings?: Array<{ status: string }>;
}

/**
 * Verifica los prerequisitos sugeridos para una etapa.
 * Retorna lista de faltantes (vacía si todo está OK).
 */
export function getMissingPrerequisites(
  stage: CaseStage,
  caseData: CaseLike
): string[] {
  const missing: string[] = [];

  switch (stage) {
    case "CONSULTA_INICIAL":
      // Sin requisitos
      break;

    case "CONTRATO_SERVICIOS":
      if (!caseData.client?.fullName) {
        missing.push("Datos del cliente");
      }
      if (!caseData.totalAgreedFee || caseData.totalAgreedFee <= 0) {
        missing.push("Honorarios pactados");
      }
      break;

    case "NEGOCIACION":
      if (!caseData.client?.fullName) {
        missing.push("Datos del cliente");
      }
      if (
        caseData.divorceType === "CONTENCIOSO" &&
        !caseData.counterpart?.fullName
      ) {
        missing.push("Datos de la contraparte (necesarios en divorcio contencioso)");
      }
      break;

    case "DEMANDA":
      if (!caseData.client?.fullName) {
        missing.push("Datos del cliente");
      }
      if (!caseData.counterpart?.fullName) {
        missing.push("Datos de la contraparte");
      }
      if (!caseData.totalAgreedFee || caseData.totalAgreedFee <= 0) {
        missing.push("Honorarios pactados");
      }
      break;

    case "PROCESO_JUDICIAL":
      if (!caseData.client?.fullName) {
        missing.push("Datos del cliente");
      }
      if (!caseData.counterpart?.fullName) {
        missing.push("Datos de la contraparte");
      }
      if (!caseData.courtName) {
        missing.push("Juzgado asignado");
      }
      if (!caseData.courtFileNumber) {
        missing.push("Número de expediente judicial");
      }
      break;

    case "SENTENCIA": {
      if (!caseData.courtFileNumber) {
        missing.push("Número de expediente judicial");
      }
      const hasRealizedHearing = caseData.hearings?.some(
        (h) => h.status === "REALIZADA"
      );
      if (!hasRealizedHearing) {
        missing.push("Audiencia realizada registrada");
      }
      break;
    }

    case "EJECUCION":
      if (!caseData.courtFileNumber) {
        missing.push("Número de expediente judicial");
      }
      break;
  }

  return missing;
}

/**
 * Plantilla de tarea común para una etapa.
 */
export interface TaskTemplate {
  title: string;
  description?: string;
  priority: 1 | 2 | 3; // 1 alta, 2 media, 3 baja
  /** Días desde hoy hasta la fecha límite sugerida. null = sin fecha. */
  daysFromNow: number | null;
}

/**
 * Plantillas de tareas que se sugieren al cambiar a cada etapa.
 * Hardcodeadas por ahora — se pueden hacer configurables después.
 */
export const TASK_TEMPLATES: Record<CaseStage, TaskTemplate[]> = {
  CONSULTA_INICIAL: [
    {
      title: "Recopilar documentación inicial del cliente",
      description: "Acta de matrimonio, identificaciones, comprobantes de ingreso",
      priority: 2,
      daysFromNow: 7,
    },
    {
      title: "Análisis preliminar del caso",
      description: "Determinar tipo de divorcio aplicable y estrategia",
      priority: 2,
      daysFromNow: 5,
    },
  ],

  CONTRATO_SERVICIOS: [
    {
      title: "Redactar contrato de prestación de servicios",
      priority: 1,
      daysFromNow: 3,
    },
    {
      title: "Firma de contrato con el cliente",
      priority: 1,
      daysFromNow: 7,
    },
    {
      title: "Cobrar anticipo de honorarios",
      priority: 2,
      daysFromNow: 7,
    },
  ],

  NEGOCIACION: [
    {
      title: "Reunir documentación completa del cliente",
      description: "Identificación, acta de matrimonio, actas de nacimiento de hijos, comprobantes de bienes",
      priority: 2,
      daysFromNow: 14,
    },
    {
      title: "Borrador de propuesta de convenio",
      priority: 2,
      daysFromNow: 21,
    },
    {
      title: "Reunión con la contraparte o su abogado",
      priority: 2,
      daysFromNow: 30,
    },
  ],

  DEMANDA: [
    {
      title: "Redactar demanda",
      priority: 1,
      daysFromNow: 14,
    },
    {
      title: "Recopilar pruebas y anexos",
      priority: 1,
      daysFromNow: 14,
    },
    {
      title: "Presentar demanda en el juzgado",
      priority: 1,
      daysFromNow: 20,
    },
  ],

  PROCESO_JUDICIAL: [
    {
      title: "Dar seguimiento al auto admisorio",
      priority: 1,
      daysFromNow: 15,
    },
    {
      title: "Notificación a la contraparte",
      priority: 1,
      daysFromNow: 30,
    },
    {
      title: "Preparar audiencia preliminar",
      priority: 2,
      daysFromNow: 45,
    },
  ],

  SENTENCIA: [
    {
      title: "Revisar sentencia con detenimiento",
      priority: 1,
      daysFromNow: 3,
    },
    {
      title: "Notificar al cliente del resultado",
      priority: 1,
      daysFromNow: 5,
    },
    {
      title: "Evaluar procedencia de apelación",
      priority: 2,
      daysFromNow: 7,
    },
  ],

  EJECUCION: [
    {
      title: "Promover ejecución de sentencia",
      priority: 1,
      daysFromNow: 10,
    },
    {
      title: "Seguimiento al cumplimiento",
      priority: 2,
      daysFromNow: 30,
    },
    {
      title: "Trámites finales y cierre del expediente",
      priority: 3,
      daysFromNow: 60,
    },
  ],
};

/**
 * Estatuses que requieren confirmación explícita por ser definitivos
 * o cambiar significativamente la operación del caso.
 */
export const STATUS_REQUIRING_CONFIRMATION: Record<string, string> = {
  CONCLUIDO:
    "Marcar el caso como concluido indica que todo el trabajo ha terminado. ¿Continuar?",
  ARCHIVADO:
    "Archivar el caso lo ocultará de la vista principal. Solo aparecerá si filtras explícitamente por archivados. ¿Continuar?",
};
