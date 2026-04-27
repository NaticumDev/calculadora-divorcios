import {
  CompensatoryFactors,
  CompensatoryResult,
  HealthStatus,
  ProfessionalOpps,
  HouseholdContribution,
  LifeStandardItems,
} from "@/types/calculation";
import { YUCATAN_DEFAULTS } from "./constants";

/**
 * Calcula la pensión compensatoria por NIVEL DE VIDA.
 *
 * Metodología del despacho: la pensión debe cubrir el mismo nivel
 * de vida que la beneficiaria tenía hasta el momento del divorcio.
 * Se suma el gasto mensual de cada rubro. Los rubros marcados como
 * "lo paga directamente el obligado" se incluyen en el nivel de vida
 * total pero NO en la pensión líquida.
 */
export function calculateLifeStandard(
  items: LifeStandardItems,
  marriageDurationYears: number,
  obligorMonthlyIncome: number
): CompensatoryResult {
  const allItems = Object.values(items);

  const lifeStandardTotal = allItems.reduce(
    (sum, it) => sum + (Number(it.monthlyAmount) || 0),
    0
  );

  // Monto a pagar como pensión líquida = rubros NO pagados directo por el obligado
  const liquidPension = allItems
    .filter((it) => !it.paidByObligor)
    .reduce((sum, it) => sum + (Number(it.monthlyAmount) || 0), 0);

  const exceedsObligorIncome =
    obligorMonthlyIncome > 0 && liquidPension > obligorMonthlyIncome;

  return {
    // Para mantener compatibilidad con el resto del flujo, los tres niveles
    // del modo "rápido" se unifican al monto líquido en modo nivel de vida.
    conservative: liquidPension,
    moderate: liquidPension,
    aggressive: liquidPension,
    selectedMonthly: liquidPension,
    durationYears: marriageDurationYears,
    totalEstimate: liquidPension * 12 * marriageDurationYears,
    mode: "LIFE_STANDARD",
    lifeStandardTotal,
    liquidPension,
    exceedsObligorIncome,
  };
}

/**
 * Calcula la pension compensatoria basada en el Art. 200 del
 * Codigo de Familia para el Estado de Yucatan.
 *
 * La pension compensatoria busca compensar el desequilibrio economico
 * causado por el divorcio, especialmente cuando uno de los conyuges
 * se dedico al hogar y a los hijos.
 *
 * Duracion: Igual a la duracion del matrimonio (Art. 200).
 * Factores: Ingreso, edad, salud, oportunidades perdidas, contribucion al hogar.
 */
export function calculateCompensatory(
  factors: CompensatoryFactors,
  customMonthly?: number
): CompensatoryResult {
  const {
    marriageDurationYears,
    obligorMonthlyIncome,
    beneficiaryMonthlyIncome,
  } = factors;

  // Si hay monto manual, usarlo directamente
  if (customMonthly !== undefined && customMonthly > 0) {
    return {
      conservative: customMonthly,
      moderate: customMonthly,
      aggressive: customMonthly,
      selectedMonthly: customMonthly,
      durationYears: marriageDurationYears,
      totalEstimate: customMonthly * 12 * marriageDurationYears,
      mode: "QUICK",
    };
  }

  // Calcular diferencial de ingresos
  const incomeDifferential =
    obligorMonthlyIncome > 0
      ? (obligorMonthlyIncome - beneficiaryMonthlyIncome) /
        obligorMonthlyIncome
      : 0;

  // Si no hay diferencial, no hay pension compensatoria
  if (incomeDifferential <= 0) {
    return {
      conservative: 0,
      moderate: 0,
      aggressive: 0,
      selectedMonthly: 0,
      durationYears: marriageDurationYears,
      totalEstimate: 0,
      mode: "QUICK",
    };
  }

  // Calcular score ponderado de factores (0.0 a 1.0)
  const factorScore = calculateFactorScore(factors, incomeDifferential);

  // Base de calculo
  const base = incomeDifferential * obligorMonthlyIncome;

  // Tres escenarios segun coeficiente de ajuste
  const coefficients = YUCATAN_DEFAULTS.COMPENSATORY_COEFFICIENTS;
  const conservative = Math.round(base * factorScore * coefficients.conservative);
  const moderate = Math.round(base * factorScore * coefficients.moderate);
  const aggressive = Math.round(base * factorScore * coefficients.aggressive);

  return {
    conservative,
    moderate,
    aggressive,
    selectedMonthly: moderate,
    durationYears: marriageDurationYears,
    totalEstimate: moderate * 12 * marriageDurationYears,
    mode: "QUICK",
  };
}

function calculateFactorScore(
  factors: CompensatoryFactors,
  incomeDifferential: number
): number {
  const weights = YUCATAN_DEFAULTS.COMPENSATORY_WEIGHTS;

  // Normalizar cada factor a 0-1
  const scores = {
    incomeDifferential: Math.min(incomeDifferential, 1),
    marriageDuration: normalizeMarriageDuration(
      factors.marriageDurationYears
    ),
    professionalOpps: normalizeProfessionalOpps(
      factors.professionalOppsLost
    ),
    householdContribution: normalizeHouseholdContribution(
      factors.householdContribution
    ),
    beneficiaryAge: normalizeAge(factors.beneficiaryAge),
    healthStatus: normalizeHealth(factors.healthStatus),
  };

  // Weighted sum
  return (
    scores.incomeDifferential * weights.incomeDifferential +
    scores.marriageDuration * weights.marriageDuration +
    scores.professionalOpps * weights.professionalOpps +
    scores.householdContribution * weights.householdContribution +
    scores.beneficiaryAge * weights.beneficiaryAge +
    scores.healthStatus * weights.healthStatus
  );
}

function normalizeMarriageDuration(years: number): number {
  // Mas anos = mayor score. Escala logaritmica, satura en ~25 anos
  return Math.min(years / 25, 1);
}

function normalizeProfessionalOpps(level: ProfessionalOpps): number {
  const map: Record<ProfessionalOpps, number> = {
    none: 0.1,
    some: 0.5,
    significant: 1.0,
  };
  return map[level];
}

function normalizeHouseholdContribution(
  level: HouseholdContribution
): number {
  const map: Record<HouseholdContribution, number> = {
    partial: 0.3,
    primary: 0.7,
    exclusive: 1.0,
  };
  return map[level];
}

function normalizeAge(age: number): number {
  // Mayor edad = mas dificil reinsertarse laboralmente
  if (age < 30) return 0.2;
  if (age < 40) return 0.4;
  if (age < 50) return 0.6;
  if (age < 60) return 0.8;
  return 1.0;
}

function normalizeHealth(status: HealthStatus): number {
  const map: Record<HealthStatus, number> = {
    good: 0.1,
    fair: 0.5,
    poor: 1.0,
  };
  return map[status];
}
