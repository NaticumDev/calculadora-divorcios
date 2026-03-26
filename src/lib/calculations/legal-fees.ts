import { LegalFeesInput, LegalFeesResult } from "@/types/calculation";

/**
 * Calcula los honorarios legales totales.
 * Los montos base son configurables por el abogado admin.
 */
export function calculateLegalFees(input: LegalFeesInput): LegalFeesResult {
  const additionalTotal = input.additionalFees.reduce(
    (sum, fee) => sum + fee.amount,
    0
  );

  return {
    baseFee: input.baseFee,
    additionalFees: input.additionalFees,
    total: input.baseFee + additionalTotal,
  };
}
