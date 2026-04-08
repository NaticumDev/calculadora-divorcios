export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const payments = await prisma.payment.findMany({
      where: { caseId: id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los pagos del caso' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const payment = await prisma.payment.create({
      data: {
        caseId: id,
        type: body.type,
        amount: body.amount,
        concept: body.concept,
        date: body.date ? new Date(body.date) : new Date(),
        receiptUrl: body.receiptUrl,
        notes: body.notes,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return NextResponse.json(
      { error: 'Error al registrar el pago' },
      { status: 500 }
    );
  }
}
