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

    const hearings = await prisma.hearing.findMany({
      where: { caseId: id },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(hearings);
  } catch (error) {
    console.error('Error al obtener audiencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener las audiencias del caso' },
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

    const hearing = await prisma.hearing.create({
      data: {
        caseId: id,
        date: new Date(body.date),
        time: body.time,
        type: body.type,
        courtName: body.courtName,
        status: body.status,
        result: body.result,
        notes: body.notes,
      },
    });

    return NextResponse.json(hearing, { status: 201 });
  } catch (error) {
    console.error('Error al crear audiencia:', error);
    return NextResponse.json(
      { error: 'Error al crear la audiencia' },
      { status: 500 }
    );
  }
}
