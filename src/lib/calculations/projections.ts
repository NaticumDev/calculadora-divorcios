import { YearlyProjection } from "@/types/calculation";
import { YUCATAN_DEFAULTS } from "./constants";

interface ProjectionInput {
  childSupportMonthly: number;
  childrenAges: number[];
  compensatoryMonthly: number;
  compensatoryDurationYears: number;
  housingMonthlyRecurring: number;
  inflationRate?: number;
}

/**
 * Genera proyecciones anuales de costos.
 * - Pension alimenticia se indexa anualmente (Art. 41 Codigo de Familia).
 * - Cada hijo se elimina al cumplir 18.
 * - Pension compensatoria dura lo que duro el matrimonio (Art. 200).
 */
export function generateProjections(input: ProjectionInput): YearlyProjection[] {
  const {
    childSupportMonthly,
    childrenAges,
    compensatoryMonthly,
    compensatoryDurationYears,
    housingMonthlyRecurring,
    inflationRate = YUCATAN_DEFAULTS.INFLATION_RATE,
  } = input;

  // Determinar cuantos anos proyectar
  const yearsUntilLastChildMajority =
    childrenAges.length > 0
      ? Math.max(
          ...childrenAges.map(
            (age) => YUCATAN_DEFAULTS.CHILD_MAJORITY_AGE - age
          )
        )
      : 0;

  const maxYears = Math.max(
    yearsUntilLastChildMajority,
    compensatoryDurationYears,
    1
  );

  const currentYear = new Date().getFullYear();
  const projections: YearlyProjection[] = [];
  let cumulativeTotal = 0;

  for (let year = 1; year <= maxYears; year++) {
    // Pension alimenticia: ajustar por inflacion y por hijos que cumplen 18
    const activeChildren = childrenAges.filter(
      (age) => age + year < YUCATAN_DEFAULTS.CHILD_MAJORITY_AGE
    ).length;

    const originalChildren = childrenAges.length;
    const childSupportRatio =
      originalChildren > 0 ? activeChildren / originalChildren : 0;

    // Indexacion anual por inflacion (Art. 41)
    const inflationFactor = Math.pow(1 + inflationRate, year - 1);

    const adjustedChildSupport =
      childSupportMonthly * childSupportRatio * inflationFactor;

    // Pension compensatoria: termina despues de la duracion del matrimonio
    const compensatoryActive = year <= compensatoryDurationYears;
    const adjustedCompensatory = compensatoryActive
      ? compensatoryMonthly * inflationFactor
      : 0;

    // Vivienda recurrente con inflacion
    const adjustedHousing = housingMonthlyRecurring * inflationFactor;

    const totalMonthly =
      adjustedChildSupport + adjustedCompensatory + adjustedHousing;
    const totalAnnual = totalMonthly * 12;
    cumulativeTotal += totalAnnual;

    projections.push({
      year,
      calendarYear: currentYear + year,
      childSupportMonthly: Math.round(adjustedChildSupport),
      childSupportAnnual: Math.round(adjustedChildSupport * 12),
      activeChildren,
      compensatoryMonthly: Math.round(adjustedCompensatory),
      compensatoryAnnual: Math.round(adjustedCompensatory * 12),
      housingMonthly: Math.round(adjustedHousing),
      housingAnnual: Math.round(adjustedHousing * 12),
      totalMonthly: Math.round(totalMonthly),
      totalAnnual: Math.round(totalAnnual),
      cumulativeTotal: Math.round(cumulativeTotal),
    });
  }

  return projections;
}
