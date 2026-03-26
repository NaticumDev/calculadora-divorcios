import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import DivorceReport from "@/components/pdf/DivorceReport";
import type {
  CalculationResult,
  ChildSupportResult,
  CompensatoryResult,
  HousingCostsResult,
  LegalFeesResult,
  YearlyProjection,
} from "@/types/calculation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParseJSON(value: string | null | undefined, fallback: any = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

interface CalculationRecord {
  id: string;
  userId: string | null;
  divorceType: string;
  marriageDurationYears: number;
  numberOfChildren: number;
  childrenAges: string;
  obligorMonthlyIncome: number;
  beneficiaryMonthlyIncome: number;
  childSupportPercentage: number;
  childSupportMonthly: number;
  childSupportDetails: string | null;
  compensatoryEnabled: boolean;
  compensatoryMonthly: number;
  compensatoryDurationYears: number;
  compensatoryFactors: string | null;
  housingCosts: string | null;
  housingCostsTotal: number;
  legalFeesTotal: number;
  monthlyTotal: number;
  annualTotal: number;
  oneTimeCosts: number;
  projections: string | null;
  notes: string | null;
  user?: { id: string; name: string; email: string } | null;
}

function reconstructResult(calc: CalculationRecord): CalculationResult {
  const childrenAges: number[] = safeParseJSON(calc.childrenAges, []);
  const childSupportDetails = safeParseJSON(calc.childSupportDetails, null);

  // Reconstruct child support result
  const childSupport: ChildSupportResult = {
    percentage: calc.childSupportPercentage,
    monthlyTotal: calc.childSupportMonthly,
    perChildMonthly:
      calc.numberOfChildren > 0
        ? calc.childSupportMonthly / calc.numberOfChildren
        : 0,
    breakdown:
      childSupportDetails?.breakdown ??
      childrenAges.map((age: number) => ({
        childAge: age,
        food: 0,
        education: 0,
        health: 0,
        clothing: 0,
        housing: 0,
        recreation: 0,
        total:
          calc.numberOfChildren > 0
            ? calc.childSupportMonthly / calc.numberOfChildren
            : 0,
      })),
  };

  // Reconstruct compensatory result
  let compensatory: CompensatoryResult | null = null;
  if (calc.compensatoryEnabled && calc.compensatoryMonthly > 0) {
    const factors = safeParseJSON(calc.compensatoryFactors, {});
    compensatory = {
      conservative: factors?.conservative ?? calc.compensatoryMonthly * 0.8,
      moderate: factors?.moderate ?? calc.compensatoryMonthly,
      aggressive: factors?.aggressive ?? calc.compensatoryMonthly * 1.2,
      selectedMonthly: calc.compensatoryMonthly,
      durationYears: calc.compensatoryDurationYears,
      totalEstimate:
        calc.compensatoryMonthly * 12 * calc.compensatoryDurationYears,
    };
  }

  // Reconstruct housing costs result
  const housingData = safeParseJSON(calc.housingCosts, null);
  const housing: HousingCostsResult = housingData ?? {
    oneTimeTotal: calc.housingCostsTotal,
    monthlyRecurring: 0,
    firstMonthTotal: calc.housingCostsTotal,
    breakdown: [],
  };

  // Reconstruct legal fees result
  const legalFees: LegalFeesResult = {
    baseFee: calc.legalFeesTotal,
    additionalFees: [],
    total: calc.legalFeesTotal,
  };

  // Reconstruct projections
  const projections: YearlyProjection[] = safeParseJSON(
    calc.projections,
    []
  );

  return {
    childSupport,
    compensatory,
    housing,
    legalFees,
    monthlyTotal: calc.monthlyTotal,
    annualTotal: calc.annualTotal,
    oneTimeCosts: calc.oneTimeCosts,
    projections,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const calculation = await prisma.calculation.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculo no encontrado." },
        { status: 404 }
      );
    }

    if (
      calculation.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tiene permiso para generar el PDF de este calculo." },
        { status: 403 }
      );
    }

    // Fetch lawyer config for branding
    const config = await prisma.lawyerConfig.findFirst();

    const branding = {
      firmName: config?.firmName ?? "Despacho Juridico",
      lawyerName: config?.lawyerName ?? "",
      phone: config?.phone ?? "",
      email: config?.email ?? "",
      address: config?.address ?? "",
      logoUrl: config?.logoUrl ?? null,
    };

    const childrenAges: number[] = safeParseJSON(
      calculation.childrenAges,
      []
    );

    const inputData = {
      divorceType: calculation.divorceType as "VOLUNTARIO" | "CONTENCIOSO",
      marriageDurationYears: calculation.marriageDurationYears,
      numberOfChildren: calculation.numberOfChildren,
      childrenAges,
      obligorMonthlyIncome: calculation.obligorMonthlyIncome,
      beneficiaryMonthlyIncome: calculation.beneficiaryMonthlyIncome,
    };

    const result = reconstructResult(
      calculation as unknown as CalculationRecord
    );

    const clientName = calculation.user?.name ?? undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(DivorceReport, {
      result,
      input: inputData,
      branding,
      clientName,
    }) as any;

    const pdfBuffer = await renderToBuffer(element);

    const filename = `reporte-divorcio-${id}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer) as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF." },
      { status: 500 }
    );
  }
}
