import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { assetId } = await params;
    const body = await request.json();

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: body,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error al actualizar bien:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el bien' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { assetId } = await params;

    await prisma.asset.delete({ where: { id: assetId } });

    return NextResponse.json({ message: 'Bien eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar bien:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el bien del caso' },
      { status: 500 }
    );
  }
}
