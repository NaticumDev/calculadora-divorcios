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

    const children = await prisma.child.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error al obtener hijos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los hijos del caso' },
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

    const child = await prisma.child.create({
      data: {
        caseId: id,
        fullName: body.fullName,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        age: body.age,
        currentCustody: body.currentCustody,
        desiredCustody: body.desiredCustody,
        notes: body.notes,
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error('Error al agregar hijo:', error);
    return NextResponse.json(
      { error: 'Error al agregar el hijo al caso' },
      { status: 500 }
    );
  }
}
