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

    // Validar cliente: nombre obligatorio
    if (!body.client || !body.client.fullName || !body.client.fullName.trim()) {
      return NextResponse.json(
        { error: 'El nombre del cliente es obligatorio' },
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

    const clientData = {
      fullName: body.client.fullName.trim(),
      phone: body.client.phone?.trim() || null,
      email: body.client.email?.trim() || null,
      curp: body.client.curp?.trim() || null,
      rfc: body.client.rfc?.trim() || null,
      address: body.client.address?.trim() || null,
      occupation: body.client.occupation?.trim() || null,
      monthlyIncome:
        body.client.monthlyIncome !== undefined &&
        body.client.monthlyIncome !== null &&
        body.client.monthlyIncome !== ''
          ? Number(body.client.monthlyIncome)
          : null,
    };

    // Crear cliente + caso en una transacción atómica con retry
    let newCase = null;
    let attempts = 0;
    let lastError: unknown = null;
    while (attempts < 5 && !newCase) {
      const caseNumber = `${prefix}${String(nextNumber + attempts).padStart(3, '0')}`;
      try {
        newCase = await prisma.$transaction(async (tx) => {
          const client = await tx.caseParty.create({ data: clientData });
          return tx.case.create({
            data: {
              caseNumber,
              divorceType: body.divorceType,
              propertyRegime: body.propertyRegime || null,
              estimatedDurationMonths: body.estimatedDurationMonths ?? null,
              internalNotes: body.internalNotes || null,
              totalAgreedFee:
                typeof body.totalAgreedFee === 'number'
                  ? body.totalAgreedFee
                  : 0,
              clientId: client.id,
            },
            include: {
              client: true,
              counterpart: true,
            },
          });
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
