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

    const risks = await prisma.risk.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(risks);
  } catch (error) {
    console.error('Error al obtener riesgos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los riesgos del caso' },
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

    const risk = await prisma.risk.create({
      data: {
        caseId: id,
        category: body.category,
        level: body.level,
        title: body.title,
        description: body.description,
        mitigationStrategy: body.mitigationStrategy,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    console.error('Error al crear riesgo:', error);
    return NextResponse.json(
      { error: 'Error al crear el riesgo' },
      { status: 500 }
    );
  }
}
