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

    const notes = await prisma.caseNote.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las notas del caso' },
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

    const note = await prisma.caseNote.create({
      data: {
        caseId: id,
        content: body.content,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error al crear nota:', error);
    return NextResponse.json(
      { error: 'Error al crear la nota' },
      { status: 500 }
    );
  }
}
