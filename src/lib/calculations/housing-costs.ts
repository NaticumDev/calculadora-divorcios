import { HousingCostsInput, HousingCostsResult } from "@/types/calculation";

/**
 * Calcula los costos de salir del hogar familiar.
 * Incluye costos unicos (mudanza, deposito, mobiliario, instalaciones)
 * y costos recurrentes mensuales (renta, servicios).
 */
export function calculateHousingCosts(
  input: HousingCostsInput
): HousingCostsResult {
  const deposit = input.monthlyRent * input.depositMonths;

  const oneTimeItems = [
    { label: "Deposito de renta", amount: deposit, type: "one-time" as const },
    { label: "Mudanza", amount: input.movingCost, type: "one-time" as const },
    {
      label: "Mobiliario basico",
      amount: input.basicFurniture,
      type: "one-time" as const,
    },
    {
      label: "Instalacion CFE (electricidad)",
      amount: input.electricitySetup,
      type: "one-time" as const,
    },
    {
      label: "Instalacion JAPAY (agua)",
      amount: input.waterSetup,
      type: "one-time" as const,
    },
    {
      label: "Instalacion gas",
      amount: input.gasSetup,
      type: "one-time" as const,
    },
    {
      label: "Instalacion internet",
      amount: input.internetSetup,
      type: "one-time" as const,
    },
  ];

  const monthlyItems = [
    { label: "Renta mensual", amount: input.monthlyRent, type: "monthly" as const },
    {
      label: "Servicios mensuales (luz, agua, gas, internet)",
      amount: input.monthlyUtilities,
      type: "monthly" as const,
    },
  ];

  const oneTimeTotal = oneTimeItems.reduce((sum, item) => sum + item.amount, 0);
  const monthlyRecurring = monthlyItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return {
    oneTimeTotal,
    monthlyRecurring,
    firstMonthTotal: oneTimeTotal + monthlyRecurring,
    breakdown: [...oneTimeItems, ...monthlyItems],
  };
}
