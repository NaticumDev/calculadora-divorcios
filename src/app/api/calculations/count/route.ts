import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Check current calculation count and limit
export async function GET() {
  try {
    const config = await prisma.lawyerConfig.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
      select: { calculationCount: true, calculationLimit: true },
    });

    return NextResponse.json({
      count: config.calculationCount,
      limit: config.calculationLimit,
      remaining: config.calculationLimit - config.calculationCount,
      limitReached: config.calculationCount >= config.calculationLimit,
    });
  } catch (error) {
    console.error("Error fetching calculation count:", error);
    return NextResponse.json(
      { error: "Error al consultar el contador." },
      { status: 500 }
    );
  }
}

// POST: Increment calculation count
export async function POST() {
  try {
    const config = await prisma.lawyerConfig.upsert({
      where: { id: "default" },
      update: {
        calculationCount: { increment: 1 },
      },
      create: { id: "default" },
      select: { calculationCount: true, calculationLimit: true },
    });

    return NextResponse.json({
      count: config.calculationCount,
      limit: config.calculationLimit,
      limitReached: config.calculationCount >= config.calculationLimit,
    });
  } catch (error) {
    console.error("Error incrementing calculation count:", error);
    return NextResponse.json(
      { error: "Error al incrementar el contador." },
      { status: 500 }
    );
  }
}
