import {
  ChildSupportInput,
  ChildSupportResult,
  ChildExpenseBreakdown,
} from "@/types/calculation";
import { YUCATAN_DEFAULTS } from "./constants";

/**
 * Calcula la pension alimenticia basada en el Codigo de Familia de Yucatan.
 * Art. 35: Principio de proporcionalidad.
 * Art. 23: Definicion de alimentos (comida, vestido, habitacion, atencion medica, educacion, esparcimiento).
 * Art. 41: Indexacion anual segun salario minimo.
 */
export function calculateChildSupport(
  input: ChildSupportInput
): ChildSupportResult {
  const { obligorMonthlyIncome, numberOfChildren, childrenAges } = input;

  if (numberOfChildren === 0 || childrenAges.length === 0) {
    return {
      percentage: 0,
      monthlyTotal: 0,
      perChildMonthly: 0,
      breakdown: [],
    };
  }

  // Determinar porcentaje aplicable
  const percentage =
    input.customPercentage ??
    getDefaultPercentage(numberOfChildren);

  const monthlyTotal = obligorMonthlyIncome * percentage;

  // Calcular distribucion por hijo con multiplicadores de edad
  const breakdown = calculateDetailedBreakdown(
    monthlyTotal,
    childrenAges,
    input.detailedBreakdown
  );

  const perChildMonthly = monthlyTotal / numberOfChildren;

  return {
    percentage,
    monthlyTotal,
    perChildMonthly,
    breakdown,
  };
}

function getDefaultPercentage(numberOfChildren: number): number {
  const percentages = YUCATAN_DEFAULTS.CHILD_SUPPORT_PERCENTAGES;
  if (numberOfChildren >= 3) return percentages[3];
  return percentages[numberOfChildren] ?? percentages[1];
}

function calculateDetailedBreakdown(
  totalMonthly: number,
  childrenAges: number[],
  customBreakdown?: ChildExpenseBreakdown[]
): ChildExpenseBreakdown[] {
  if (customBreakdown && customBreakdown.length > 0) {
    return customBreakdown;
  }

  // Calcular multiplicadores de edad para distribuir proporcionalmente
  const multipliers = childrenAges.map((age) => getAgeMultiplier(age));
  const totalWeight = multipliers.reduce((sum, m) => sum + m, 0);

  return childrenAges.map((age, index) => {
    const childShare = totalMonthly * (multipliers[index] / totalWeight);
    const dist = YUCATAN_DEFAULTS.EXPENSE_DISTRIBUTION;

    return {
      childAge: age,
      food: childShare * dist.food.percentage,
      education: childShare * dist.education.percentage,
      health: childShare * dist.health.percentage,
      clothing: childShare * dist.clothing.percentage,
      housing: childShare * dist.housing.percentage,
      recreation: childShare * dist.recreation.percentage,
      total: childShare,
    };
  });
}

function getAgeMultiplier(age: number): number {
  const bracket = YUCATAN_DEFAULTS.AGE_MULTIPLIERS.find(
    (b) => age >= b.minAge && age <= b.maxAge
  );
  return bracket?.multiplier ?? 1.0;
}

/**
 * Obtiene la etiqueta del grupo de edad para un nino.
 */
export function getAgeGroupLabel(age: number): string {
  const bracket = YUCATAN_DEFAULTS.AGE_MULTIPLIERS.find(
    (b) => age >= b.minAge && age <= b.maxAge
  );
  return bracket?.label ?? "Menor";
}
