"use client";

import { create } from "zustand";
import {
  WizardState,
  DivorceType,
  CalculationResult,
  ChildExpenseBreakdown,
  EstimateLevel,
  HealthStatus,
  ProfessionalOpps,
  HouseholdContribution,
  HousingCostsInput,
  CompensatoryMode,
  LifeStandardItems,
  LifeStandardItem,
} from "@/types/calculation";
import { calculateDivorceCosts } from "@/lib/calculations/engine";
import { YUCATAN_DEFAULTS } from "@/lib/calculations/constants";

const emptyLifeStandardItem = (): LifeStandardItem => ({
  monthlyAmount: 0,
  paidByObligor: false,
});

const emptyLifeStandardItems = (): LifeStandardItems => ({
  housing: emptyLifeStandardItem(),
  householdServices: emptyLifeStandardItem(),
  domesticServices: emptyLifeStandardItem(),
  food: emptyLifeStandardItem(),
  hygieneSupplies: emptyLifeStandardItem(),
  clothing: emptyLifeStandardItem(),
  personalCare: emptyLifeStandardItem(),
  transport: emptyLifeStandardItem(),
  medical: emptyLifeStandardItem(),
  recreation: emptyLifeStandardItem(),
});

const defaults = YUCATAN_DEFAULTS;
const housing = defaults.MERIDA_HOUSING;

const initialState: WizardState = {
  currentStep: 1,
  isDetailedChildSupport: false,
  result: null,

  divorceType: "VOLUNTARIO",
  marriageDurationYears: 5,
  numberOfChildren: 1,
  childrenAges: [5],
  obligorMonthlyIncome: 20000,
  beneficiaryMonthlyIncome: 0,

  childSupport: {
    obligorMonthlyIncome: 20000,
    numberOfChildren: 1,
    childrenAges: [5],
  },

  compensatory: {
    enabled: false,
    marriageDurationYears: 5,
    obligorMonthlyIncome: 20000,
    beneficiaryMonthlyIncome: 0,
    beneficiaryAge: 35,
    healthStatus: "good",
    professionalOppsLost: "none",
    householdContribution: "partial",
    estimateLevel: "moderate",
    mode: "QUICK",
    lifeStandardItems: emptyLifeStandardItems(),
    lifeStandardNotes: "",
  },

  housing: {
    monthlyRent: housing.avgRentMid,
    depositMonths: housing.depositMonths,
    movingCost: housing.movingCost,
    basicFurniture: housing.basicFurniture,
    electricitySetup: housing.cfeSetup,
    waterSetup: housing.japaySetup,
    gasSetup: housing.gasSetup,
    internetSetup: housing.internetSetup,
    monthlyUtilities: housing.monthlyUtilities,
  },

  legalFees: {
    divorceType: "VOLUNTARIO",
    baseFee: defaults.LEGAL_FEES.voluntary,
    additionalFees: [],
  },
};

interface CalculationActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDivorceType: (type: DivorceType) => void;
  setFamilyInfo: (data: {
    marriageDurationYears: number;
    numberOfChildren: number;
    childrenAges: number[];
  }) => void;
  setIncome: (obligor: number, beneficiary: number) => void;
  setChildSupportPercentage: (pct: number) => void;
  setDetailedChildSupport: (enabled: boolean) => void;
  setChildBreakdown: (breakdown: ChildExpenseBreakdown[]) => void;
  setCompensatoryEnabled: (enabled: boolean) => void;
  setCompensatoryFactors: (factors: Partial<WizardState["compensatory"]>) => void;
  setEstimateLevel: (level: EstimateLevel) => void;
  setCompensatoryMode: (mode: CompensatoryMode) => void;
  setLifeStandardItem: (
    key: keyof LifeStandardItems,
    item: Partial<LifeStandardItem>
  ) => void;
  setLifeStandardNotes: (notes: string) => void;
  setHousing: (data: Partial<HousingCostsInput>) => void;
  setLegalFees: (baseFee: number, additional: { name: string; amount: number }[]) => void;
  calculate: () => CalculationResult;
  reset: () => void;
}

export const useCalculation = create<WizardState & CalculationActions>(
  (set, get) => ({
    ...initialState,

    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 8) })),
    prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

    setDivorceType: (type) =>
      set((s) => ({
        divorceType: type,
        legalFees: {
          ...s.legalFees,
          divorceType: type,
          baseFee:
            type === "VOLUNTARIO"
              ? defaults.LEGAL_FEES.voluntary
              : defaults.LEGAL_FEES.contested,
        },
      })),

    setFamilyInfo: ({ marriageDurationYears, numberOfChildren, childrenAges }) =>
      set((s) => ({
        marriageDurationYears,
        numberOfChildren,
        childrenAges,
        childSupport: {
          ...s.childSupport,
          numberOfChildren,
          childrenAges,
        },
        compensatory: {
          ...s.compensatory,
          marriageDurationYears,
        },
      })),

    setIncome: (obligor, beneficiary) =>
      set((s) => ({
        obligorMonthlyIncome: obligor,
        beneficiaryMonthlyIncome: beneficiary,
        childSupport: {
          ...s.childSupport,
          obligorMonthlyIncome: obligor,
        },
        compensatory: {
          ...s.compensatory,
          obligorMonthlyIncome: obligor,
          beneficiaryMonthlyIncome: beneficiary,
        },
      })),

    setChildSupportPercentage: (pct) =>
      set((s) => ({
        childSupport: {
          ...s.childSupport,
          customPercentage: pct,
        },
      })),

    setDetailedChildSupport: (enabled) => set({ isDetailedChildSupport: enabled }),

    setChildBreakdown: (breakdown) =>
      set((s) => ({
        childSupport: {
          ...s.childSupport,
          detailedBreakdown: breakdown,
        },
      })),

    setCompensatoryEnabled: (enabled) =>
      set((s) => ({
        compensatory: { ...s.compensatory, enabled },
      })),

    setCompensatoryFactors: (factors) =>
      set((s) => ({
        compensatory: { ...s.compensatory, ...factors },
      })),

    setEstimateLevel: (level) =>
      set((s) => ({
        compensatory: { ...s.compensatory, estimateLevel: level },
      })),

    setCompensatoryMode: (mode) =>
      set((s) => ({
        compensatory: { ...s.compensatory, mode },
      })),

    setLifeStandardItem: (key, item) =>
      set((s) => ({
        compensatory: {
          ...s.compensatory,
          lifeStandardItems: {
            ...s.compensatory.lifeStandardItems,
            [key]: { ...s.compensatory.lifeStandardItems[key], ...item },
          },
        },
      })),

    setLifeStandardNotes: (notes) =>
      set((s) => ({
        compensatory: { ...s.compensatory, lifeStandardNotes: notes },
      })),

    setHousing: (data) =>
      set((s) => ({
        housing: { ...s.housing, ...data },
      })),

    setLegalFees: (baseFee, additional) =>
      set((s) => ({
        legalFees: {
          ...s.legalFees,
          baseFee,
          additionalFees: additional,
        },
      })),

    calculate: () => {
      const state = get();
      const result = calculateDivorceCosts({
        divorceType: state.divorceType,
        marriageDurationYears: state.marriageDurationYears,
        numberOfChildren: state.numberOfChildren,
        childrenAges: state.childrenAges,
        obligorMonthlyIncome: state.obligorMonthlyIncome,
        beneficiaryMonthlyIncome: state.beneficiaryMonthlyIncome,
        childSupport: state.childSupport,
        compensatory: state.compensatory,
        housing: state.housing,
        legalFees: state.legalFees,
      });
      set({ result });
      return result;
    },

    reset: () => set(initialState),
  })
);
