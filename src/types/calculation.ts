export type DivorceType = "VOLUNTARIO" | "CONTENCIOSO";

export type HealthStatus = "good" | "fair" | "poor";
export type ProfessionalOpps = "none" | "some" | "significant";
export type HouseholdContribution = "partial" | "primary" | "exclusive";
export type EstimateLevel = "conservative" | "moderate" | "aggressive";

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
  conservative: number;
  moderate: number;
  aggressive: number;
  selectedMonthly: number;
  durationYears: number;
  totalEstimate: number;
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
