import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; riskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { riskId } = await params;
    const body = await request.json();

    const risk = await prisma.risk.update({
      where: { id: riskId },
      data: {
        category: body.category,
        level: body.level,
        title: body.title,
        description: body.description,
        mitigationStrategy: body.mitigationStrategy,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Error al actualizar riesgo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el riesgo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; riskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { riskId } = await params;

    await prisma.risk.delete({ where: { id: riskId } });

    return NextResponse.json({ message: 'Riesgo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar riesgo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el riesgo' },
      { status: 500 }
    );
  }
}
