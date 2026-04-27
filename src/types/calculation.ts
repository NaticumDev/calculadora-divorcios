export type DivorceType = "VOLUNTARIO" | "CONTENCIOSO";

export type HealthStatus = "good" | "fair" | "poor";
export type ProfessionalOpps = "none" | "some" | "significant";
export type HouseholdContribution = "partial" | "primary" | "exclusive";
export type EstimateLevel = "conservative" | "moderate" | "aggressive";

/**
 * Modo de cálculo de pensión compensatoria:
 * - QUICK: Estimación rápida con factores ponderados (Art. 200, basado en diferencial de ingresos y factores ajustados).
 * - LIFE_STANDARD: Cálculo detallado por rubros para mantener el mismo nivel de vida que la beneficiaria tenía durante el matrimonio.
 */
export type CompensatoryMode = "QUICK" | "LIFE_STANDARD";

/**
 * Un rubro del cálculo detallado por nivel de vida.
 * Si paidByObligor=true, el rubro NO se incluye en la pensión líquida
 * (lo paga directamente el obligado).
 */
export interface LifeStandardItem {
  monthlyAmount: number;
  paidByObligor: boolean;
}

/**
 * Conjunto de rubros del cálculo "por nivel de vida"
 * (basado en metodología del despacho).
 */
export interface LifeStandardItems {
  housing: LifeStandardItem;             // Techo (renta)
  householdServices: LifeStandardItem;   // Servicios del hogar (luz, agua, gas, internet, etc.)
  domesticServices: LifeStandardItem;    // Servicios domésticos (personal, jardinería, piscina)
  food: LifeStandardItem;                // Alimentación (víveres semanales/quincenales)
  hygieneSupplies: LifeStandardItem;     // Limpieza e higiene personal
  clothing: LifeStandardItem;            // Ropa y calzado (promedio anual / 12)
  personalCare: LifeStandardItem;        // Cuidado personal (corte de pelo, manos, pies)
  transport: LifeStandardItem;           // Transporte (gasolina, seguro, mantenimiento)
  medical: LifeStandardItem;             // Gastos médicos (póliza GMM, medicamentos)
  recreation: LifeStandardItem;          // Esparcimiento (mensual + vacaciones anuales prorrateadas)
}

export interface ChildExpenseBreakdown {
  childAge: number;
  food: number;
  education: number;
  health: number;
  clothing: number;
  housing: number;
  recreation: number;
  total: number;
}

export interface ChildSupportInput {
  obligorMonthlyIncome: number;
  numberOfChildren: number;
  childrenAges: number[];
  customPercentage?: number;
  detailedBreakdown?: ChildExpenseBreakdown[];
}

export interface ChildSupportResult {
  percentage: number;
  monthlyTotal: number;
  perChildMonthly: number;
  breakdown: ChildExpenseBreakdown[];
}

export interface CompensatoryFactors {
  marriageDurationYears: number;
  obligorMonthlyIncome: number;
  beneficiaryMonthlyIncome: number;
  beneficiaryAge: number;
  healthStatus: HealthStatus;
  professionalOppsLost: ProfessionalOpps;
  householdContribution: HouseholdContribution;
}

export interface CompensatoryResult {
  // Modo QUICK: tres niveles ponderados
  conservative: number;
  moderate: number;
  aggressive: number;
  selectedMonthly: number;
  durationYears: number;
  totalEstimate: number;

  // Modo LIFE_STANDARD: desglose adicional (opcional)
  mode?: CompensatoryMode;
  /** Suma total de todos los rubros del nivel de vida (incluye los que paga el obligado directo) */
  lifeStandardTotal?: number;
  /** Monto a pagar como pensión líquida (solo rubros NO pagados directamente por el obligado) */
  liquidPension?: number;
  /** Indica si el monto excede los ingresos del obligado */
  exceedsObligorIncome?: boolean;
}

export interface HousingCostsInput {
  monthlyRent: number;
  depositMonths: number;
  movingCost: number;
  basicFurniture: number;
  electricitySetup: number;
  waterSetup: number;
  gasSetup: number;
  internetSetup: number;
  monthlyUtilities: number;
}

export interface HousingCostsResult {
  oneTimeTotal: number;
  monthlyRecurring: number;
  firstMonthTotal: number;
  breakdown: {
    label: string;
    amount: number;
    type: "one-time" | "monthly";
  }[];
}

export interface LegalFeesInput {
  divorceType: DivorceType;
  baseFee: number;
  additionalFees: { name: string; amount: number }[];
}

export interface LegalFeesResult {
  baseFee: number;
  additionalFees: { name: string; amount: number }[];
  total: number;
}

export interface YearlyProjection {
  year: number;
  calendarYear: number;
  childSupportMonthly: number;
  childSupportAnnual: number;
  activeChildren: number;
  compensatoryMonthly: number;
  compensatoryAnnual: number;
  housingMonthly: number;
  housingAnnual: number;
  totalMonthly: number;
  totalAnnual: number;
  cumulativeTotal: number;
}

export interface CalculationInput {
  divorceType: DivorceType;
  marriageDurationYears: number;
  numberOfChildren: number;
  childrenAges: number[];
  obligorMonthlyIncome: number;
  beneficiaryMonthlyIncome: number;
  childSupport: ChildSupportInput;
  compensatory: CompensatoryFactors & {
    enabled: boolean;
    customMonthly?: number;
    estimateLevel: EstimateLevel;
    mode: CompensatoryMode;
    lifeStandardItems: LifeStandardItems;
    lifeStandardNotes?: string;
  };
  housing: HousingCostsInput;
  legalFees: LegalFeesInput;
}

export interface CalculationResult {
  childSupport: ChildSupportResult;
  compensatory: CompensatoryResult | null;
  housing: HousingCostsResult;
  legalFees: LegalFeesResult;
  monthlyTotal: number;
  annualTotal: number;
  oneTimeCosts: number;
  projections: YearlyProjection[];
}

export interface WizardState extends CalculationInput {
  currentStep: number;
  isDetailedChildSupport: boolean;
  result: CalculationResult | null;
}
