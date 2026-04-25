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

/**
 * PUT /api/cases/[id]
 *
 * Actualiza datos del caso. Solo se aceptan campos administrativos
 * editables (whitelist). Los campos clientId/counterpartId se gestionan
 * desde el endpoint /parties.
 */
const ALLOWED_FIELDS = [
  'divorceType',
  'stage',
  'status',
  'propertyRegime',
  'courtName',
  'courtFileNumber',
  'opposingLawyer',
  'opposingLawyerPhone',
  'opposingLawyerEmail',
  'estimatedDurationMonths',
  'startDate',
  'endDate',
  'totalAgreedFee',
  'internalNotes',
] as const;

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

    // Whitelist + normalización de tipos
    const data: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (!(field in body)) continue;
      const value = body[field];

      if (field === 'startDate' || field === 'endDate') {
        data[field] = value ? new Date(value) : null;
      } else if (
        field === 'estimatedDurationMonths' ||
        field === 'totalAgreedFee'
      ) {
        data[field] =
          value === null || value === '' || value === undefined
            ? null
            : Number(value);
      } else {
        data[field] = value === '' ? null : value;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    const updated = await prisma.case.update({
      where: { id },
      data,
      include: {
        client: true,
        counterpart: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar caso:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al actualizar el caso', detail: message },
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
