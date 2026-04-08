import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; hearingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { hearingId } = await params;
    const body = await request.json();

    const hearing = await prisma.hearing.update({
      where: { id: hearingId },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        time: body.time,
        type: body.type,
        courtName: body.courtName,
        status: body.status,
        result: body.result,
        notes: body.notes,
      },
    });

    return NextResponse.json(hearing);
  } catch (error) {
    console.error('Error al actualizar audiencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la audiencia' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; hearingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { hearingId } = await params;

    await prisma.hearing.delete({ where: { id: hearingId } });

    return NextResponse.json({ message: 'Audiencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar audiencia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la audiencia' },
      { status: 500 }
    );
  }
}
