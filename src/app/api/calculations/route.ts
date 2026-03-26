import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    // Admin can fetch all calculations
    if (all === "true" && session.user.role === "ADMIN") {
      const calculations = await prisma.calculation.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(calculations);
    }

    // Regular users only get their own calculations
    const calculations = await prisma.calculation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(calculations);
  } catch (error) {
    console.error("Error fetching calculations:", error);
    return NextResponse.json(
      { error: "Error al obtener los calculos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const calculation = await prisma.calculation.create({
      data: {
        userId: session?.user?.id ?? null,
        divorceType: body.divorceType,
        marriageDurationYears: body.marriageDurationYears,
        numberOfChildren: body.numberOfChildren ?? 0,
        childrenAges: body.childrenAges ?? "[]",
        obligorMonthlyIncome: body.obligorMonthlyIncome,
        beneficiaryMonthlyIncome: body.beneficiaryMonthlyIncome ?? 0,
        childSupportPercentage: body.childSupportPercentage,
        childSupportMonthly: body.childSupportMonthly,
        childSupportDetails: body.childSupportDetails ?? null,
        compensatoryEnabled: body.compensatoryEnabled ?? false,
        compensatoryMonthly: body.compensatoryMonthly ?? 0,
        compensatoryDurationYears: body.compensatoryDurationYears ?? 0,
        compensatoryFactors: body.compensatoryFactors ?? null,
        housingCosts: body.housingCosts ?? null,
        housingCostsTotal: body.housingCostsTotal ?? 0,
        legalFeesTotal: body.legalFeesTotal ?? 0,
        monthlyTotal: body.monthlyTotal,
        annualTotal: body.annualTotal,
        oneTimeCosts: body.oneTimeCosts,
        projections: body.projections ?? null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    console.error("Error creating calculation:", error);
    return NextResponse.json(
      { error: "Error al crear el calculo." },
      { status: 500 }
    );
  }
}
