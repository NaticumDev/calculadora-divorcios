import { CalculationInput, CalculationResult } from "@/types/calculation";
import { calculateChildSupport } from "./pension-alimenticia";
import { calculateCompensatory } from "./pension-compensatoria";
import { calculateHousingCosts } from "./housing-costs";
import { calculateLegalFees } from "./legal-fees";
import { generateProjections } from "./projections";

/**
 * Motor central de calculo.
 * Coordina todos los sub-calculadores y produce el resultado completo.
 */
export function calculateDivorceCosts(
  input: CalculationInput
): CalculationResult {
  // 1. Pension alimenticia
  const childSupport = calculateChildSupport(input.childSupport);

  // 2. Pension compensatoria
  let compensatory = null;
  if (input.compensatory.enabled) {
    const result = calculateCompensatory(
      {
        marriageDurationYears: input.compensatory.marriageDurationYears,
        obligorMonthlyIncome: input.compensatory.obligorMonthlyIncome,
        beneficiaryMonthlyIncome: input.compensatory.beneficiaryMonthlyIncome,
        beneficiaryAge: input.compensatory.beneficiaryAge,
        healthStatus: input.compensatory.healthStatus,
        professionalOppsLost: input.compensatory.professionalOppsLost,
        householdContribution: input.compensatory.householdContribution,
      },
      input.compensatory.customMonthly
    );

    // Aplicar nivel de estimacion seleccionado
    const selectedMonthly =
      input.compensatory.customMonthly ??
      result[input.compensatory.estimateLevel];

    compensatory = {
      ...result,
      selectedMonthly,
      totalEstimate: selectedMonthly * 12 * result.durationYears,
    };
  }

  // 3. Costos de vivienda
  const housing = calculateHousingCosts(input.housing);

  // 4. Honorarios legales
  const legalFees = calculateLegalFees(input.legalFees);

  // 5. Totales
  const monthlyTotal =
    childSupport.monthlyTotal +
    (compensatory?.selectedMonthly ?? 0) +
    housing.monthlyRecurring;

  const annualTotal = monthlyTotal * 12;

  const oneTimeCosts = housing.oneTimeTotal + legalFees.total;

  // 6. Proyecciones
  const projections = generateProjections({
    childSupportMonthly: childSupport.monthlyTotal,
    childrenAges: input.childSupport.childrenAges,
    compensatoryMonthly: compensatory?.selectedMonthly ?? 0,
    compensatoryDurationYears: compensatory?.durationYears ?? 0,
    housingMonthlyRecurring: housing.monthlyRecurring,
  });

  return {
    childSupport,
    compensatory,
    housing,
    legalFees,
    monthlyTotal,
    annualTotal,
    oneTimeCosts,
    projections,
  };
}
