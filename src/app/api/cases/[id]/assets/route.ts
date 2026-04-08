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

    const assets = await prisma.asset.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error al obtener bienes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los bienes del caso' },
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

    const asset = await prisma.asset.create({
      data: {
        caseId: id,
        type: body.type,
        description: body.description,
        ownerName: body.ownerName,
        estimatedValue: body.estimatedValue,
        propertyAddress: body.propertyAddress,
        deedNumber: body.deedNumber,
        companyName: body.companyName,
        companyRfc: body.companyRfc,
        ownershipPercentage: body.ownershipPercentage,
        roleInCompany: body.roleInCompany,
        debtBalance: body.debtBalance,
        creditorName: body.creditorName,
        notes: body.notes,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error al agregar bien:', error);
    return NextResponse.json(
      { error: 'Error al agregar el bien al caso' },
      { status: 500 }
    );
  }
}
