"use client";

import { useCalculation } from "@/hooks/useCalculation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Step1DivorceType from "./steps/Step1DivorceType";
import Step2FamilyInfo from "./steps/Step2FamilyInfo";
import Step3Income from "./steps/Step3Income";
import Step4PensionAlimenticia from "./steps/Step4PensionAlimenticia";
import Step5PensionCompensatoria from "./steps/Step5PensionCompensatoria";
import Step6HousingCosts from "./steps/Step6HousingCosts";
import Step7LegalFees from "./steps/Step7LegalFees";
import Step8Summary from "./steps/Step8Summary";

const STEP_LABELS = [
  "Tipo de divorcio",
  "Familia",
  "Ingresos",
  "Pensión alimenticia",
  "Pensión compensatoria",
  "Vivienda",
  "Honorarios legales",
  "Resumen",
];

export default function CalculatorWizard({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const { currentStep, nextStep, prevStep, calculate } = useCalculation();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1DivorceType />;
      case 2:
        return <Step2FamilyInfo />;
      case 3:
        return <Step3Income />;
      case 4:
        return <Step4PensionAlimenticia />;
      case 5:
        return <Step5PensionCompensatoria />;
      case 6:
        return <Step6HousingCosts />;
      case 7:
        return <Step7LegalFees />;
      case 8:
        return <Step8Summary isAuthenticated={isAuthenticated} />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep === 8) {
      calculate();
    } else {
      nextStep();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Progress indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Paso {currentStep} de 8
          </span>
          <Badge variant="secondary">{STEP_LABELS[currentStep - 1]}</Badge>
        </div>

        <div className="flex gap-1.5">
          {STEP_LABELS.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index + 1 <= currentStep
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation */}
      {currentStep < 8 && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          <Button onClick={handleNext}>
            {currentStep === 7 ? "Calcular" : "Siguiente"}
          </Button>
        </div>
      )}
    </div>
  );
}
