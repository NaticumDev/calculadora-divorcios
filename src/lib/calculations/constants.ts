// Constantes basadas en la legislación y práctica judicial de Yucatán
// Código de Familia para el Estado de Yucatán

export const YUCATAN_DEFAULTS = {
  // Indicadores económicos 2026 (actualizables por admin)
  UMA_DAILY: 113.14,
  MINIMUM_WAGE_DAILY: 278.8,
  INFLATION_RATE: 0.05,

  // Edad de mayoría - pensión alimenticia termina
  CHILD_MAJORITY_AGE: 18,

  // Porcentajes de práctica judicial para pensión alimenticia
  // No son estatutarios (Art. 35 principio de proporcionalidad)
  // sino guías basadas en criterios judiciales comunes en Yucatán
  CHILD_SUPPORT_PERCENTAGES: {
    1: 0.15,
    2: 0.2,
    3: 0.3,
  } as Record<number, number>,
  CHILD_SUPPORT_MAX_PERCENTAGE: 0.4,

  // Multiplicadores por grupo de edad
  AGE_MULTIPLIERS: [
    { minAge: 0, maxAge: 5, multiplier: 1.0, label: "Infante (0-5)" },
    { minAge: 6, maxAge: 12, multiplier: 1.1, label: "Escolar (6-12)" },
    { minAge: 13, maxAge: 17, multiplier: 1.25, label: "Adolescente (13-17)" },
  ],

  // Distribución de gastos por hijo según Art. 23
  // "alimentos comprenden comida, vestido, habitación, atención médica,
  //  educación y esparcimiento"
  EXPENSE_DISTRIBUTION: {
    food: { percentage: 0.3, label: "Alimentación" },
    education: { percentage: 0.25, label: "Educación" },
    health: { percentage: 0.15, label: "Salud" },
    clothing: { percentage: 0.1, label: "Vestido" },
    housing: { percentage: 0.1, label: "Habitación" },
    recreation: { percentage: 0.1, label: "Esparcimiento" },
  },

  // Coeficientes de ajuste para pensión compensatoria (Art. 200)
  COMPENSATORY_COEFFICIENTS: {
    conservative: 0.3,
    moderate: 0.4,
    aggressive: 0.5,
  },

  // Pesos de factores para pensión compensatoria
  COMPENSATORY_WEIGHTS: {
    incomeDifferential: 0.25,
    marriageDuration: 0.2,
    professionalOpps: 0.15,
    householdContribution: 0.15,
    beneficiaryAge: 0.15,
    healthStatus: 0.1,
  },

  // Costos de vivienda defaults (Mérida, Yucatán)
  MERIDA_HOUSING: {
    avgRentLow: 5000,
    avgRentMid: 8000,
    avgRentHigh: 12000,
    depositMonths: 2,
    movingCost: 4000,
    basicFurniture: 20000,
    cfeSetup: 800,
    japaySetup: 500,
    gasSetup: 1500,
    internetSetup: 800,
    monthlyUtilities: 2500,
  },

  // Honorarios legales defaults
  LEGAL_FEES: {
    voluntary: 15000,
    contested: 35000,
  },
} as const;
