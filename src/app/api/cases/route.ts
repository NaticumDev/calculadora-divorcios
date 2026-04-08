export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const cases = await prisma.case.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        client: true,
        counterpart: true,
      },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los casos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Auto-generate caseNumber as NAT-YYYY-NNN
    const year = new Date().getFullYear();
    const prefix = `NAT-${year}-`;

    const lastCase = await prisma.case.findFirst({
      where: { caseNumber: { startsWith: prefix } },
      orderBy: { caseNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastCase) {
      const lastNumber = parseInt(lastCase.caseNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    const caseNumber = `${prefix}${String(nextNumber).padStart(3, '0')}`;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        divorceType: body.divorceType,
        propertyRegime: body.propertyRegime,
        estimatedDurationMonths: body.estimatedDurationMonths,
        internalNotes: body.internalNotes,
        totalAgreedFee: body.totalAgreedFee ?? 0,
      },
      include: {
        client: true,
        counterpart: true,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Error al crear caso:', error);
    return NextResponse.json(
      { error: 'Error al crear el caso' },
      { status: 500 }
    );
  }
}
