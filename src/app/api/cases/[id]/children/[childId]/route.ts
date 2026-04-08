import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; childId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { childId } = await params;
    const body = await request.json();

    const child = await prisma.child.update({
      where: { id: childId },
      data: {
        fullName: body.fullName,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        age: body.age,
        currentCustody: body.currentCustody,
        desiredCustody: body.desiredCustody,
        notes: body.notes,
      },
    });

    return NextResponse.json(child);
  } catch (error) {
    console.error('Error al actualizar hijo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar los datos del hijo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; childId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { childId } = await params;

    await prisma.child.delete({ where: { id: childId } });

    return NextResponse.json({ message: 'Hijo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar hijo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el hijo del caso' },
      { status: 500 }
    );
  }
}
