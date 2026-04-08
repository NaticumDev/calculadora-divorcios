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

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        counterpart: true,
        children: true,
        assets: true,
        payments: true,
        hearings: true,
        risks: true,
        tasks: true,
        notes: { orderBy: { createdAt: 'desc' } },
        feeSchedule: true,
        documents: true,
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error('Error al obtener caso:', error);
    return NextResponse.json(
      { error: 'Error al obtener el caso' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const updated = await prisma.case.update({
      where: { id },
      data: body,
      include: {
        client: true,
        counterpart: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar caso:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el caso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.case.delete({ where: { id } });

    return NextResponse.json({ message: 'Caso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar caso:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el caso' },
      { status: 500 }
    );
  }
}
