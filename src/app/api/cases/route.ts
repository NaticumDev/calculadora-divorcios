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
        hearings: {
          select: { date: true, status: true },
        },
      },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al obtener los casos', detail: message },
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

    // Validate required fields
    if (!body.divorceType || (body.divorceType !== 'VOLUNTARIO' && body.divorceType !== 'CONTENCIOSO')) {
      return NextResponse.json(
        { error: 'Tipo de divorcio inválido' },
        { status: 400 }
      );
    }

    // Auto-generate caseNumber as NAT-YYYY-NNN with retry on uniqueness conflict
    const year = new Date().getFullYear();
    const prefix = `NAT-${year}-`;

    const lastCase = await prisma.case.findFirst({
      where: { caseNumber: { startsWith: prefix } },
      orderBy: { caseNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastCase) {
      const parts = lastCase.caseNumber.split('-');
      const parsed = parseInt(parts[2] || '0', 10);
      nextNumber = (isNaN(parsed) ? 0 : parsed) + 1;
    }

    // Try up to 5 times in case of race condition on unique caseNumber
    let newCase = null;
    let attempts = 0;
    let lastError: unknown = null;
    while (attempts < 5 && !newCase) {
      const caseNumber = `${prefix}${String(nextNumber + attempts).padStart(3, '0')}`;
      try {
        newCase = await prisma.case.create({
          data: {
            caseNumber,
            divorceType: body.divorceType,
            propertyRegime: body.propertyRegime || null,
            estimatedDurationMonths: body.estimatedDurationMonths ?? null,
            internalNotes: body.internalNotes || null,
            totalAgreedFee: typeof body.totalAgreedFee === 'number' ? body.totalAgreedFee : 0,
          },
          include: {
            client: true,
            counterpart: true,
          },
        });
      } catch (err: unknown) {
        lastError = err;
        // P2002 = Unique constraint failed. Retry with next number.
        const code = (err as { code?: string })?.code;
        if (code === 'P2002') {
          attempts++;
          continue;
        }
        throw err;
      }
    }

    if (!newCase) {
      throw lastError || new Error('No se pudo generar un número de caso único');
    }

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Error al crear caso:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const code = (error as { code?: string })?.code;
    return NextResponse.json(
      {
        error: 'Error al crear el caso',
        detail: message,
        ...(code ? { code } : {}),
      },
      { status: 500 }
    );
  }
}
