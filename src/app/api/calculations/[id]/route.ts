import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    // Must be owner or admin
    if (calculation.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tiene permiso para ver este calculo." },
        { status: 403 }
      );
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error("Error fetching calculation:", error);
    return NextResponse.json(
      { error: "Error al obtener el calculo." },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const existing = await prisma.calculation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Calculo no encontrado." },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tiene permiso para editar este calculo." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const calculation = await prisma.calculation.update({
      where: { id },
      data: {
        divorceType: body.divorceType,
        marriageDurationYears: body.marriageDurationYears,
        numberOfChildren: body.numberOfChildren,
        childrenAges: body.childrenAges,
        obligorMonthlyIncome: body.obligorMonthlyIncome,
        beneficiaryMonthlyIncome: body.beneficiaryMonthlyIncome,
        childSupportPercentage: body.childSupportPercentage,
        childSupportMonthly: body.childSupportMonthly,
        childSupportDetails: body.childSupportDetails,
        compensatoryEnabled: body.compensatoryEnabled,
        compensatoryMonthly: body.compensatoryMonthly,
        compensatoryDurationYears: body.compensatoryDurationYears,
        compensatoryFactors: body.compensatoryFactors,
        housingCosts: body.housingCosts,
        housingCostsTotal: body.housingCostsTotal,
        legalFeesTotal: body.legalFeesTotal,
        monthlyTotal: body.monthlyTotal,
        annualTotal: body.annualTotal,
        oneTimeCosts: body.oneTimeCosts,
        projections: body.projections,
        notes: body.notes,
      },
    });

    return NextResponse.json(calculation);
  } catch (error) {
    console.error("Error updating calculation:", error);
    return NextResponse.json(
      { error: "Error al actualizar el calculo." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existing = await prisma.calculation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Calculo no encontrado." },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tiene permiso para eliminar este calculo." },
        { status: 403 }
      );
    }

    await prisma.calculation.delete({ where: { id } });

    return NextResponse.json({ message: "Calculo eliminado exitosamente." });
  } catch (error) {
    console.error("Error deleting calculation:", error);
    return NextResponse.json(
      { error: "Error al eliminar el calculo." },
      { status: 500 }
    );
  }
}
