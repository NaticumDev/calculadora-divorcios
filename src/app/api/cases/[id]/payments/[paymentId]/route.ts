import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { paymentId } = await params;
    const body = await request.json();

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        type: body.type,
        amount: body.amount,
        concept: body.concept,
        date: body.date ? new Date(body.date) : undefined,
        receiptUrl: body.receiptUrl,
        notes: body.notes,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el pago' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { paymentId } = await params;

    await prisma.payment.delete({ where: { id: paymentId } });

    return NextResponse.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el pago' },
      { status: 500 }
    );
  }
}
