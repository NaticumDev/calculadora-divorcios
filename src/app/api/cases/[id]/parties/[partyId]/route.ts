import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/cases/[id]/parties/[partyId]
 *
 * Desvincula y elimina una parte (cliente o contraparte) del caso.
 * Limpia clientId/counterpartId en el caso antes de eliminar la parte.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; partyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, partyId } = await params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
    }

    // Verificar que la parte pertenece a este caso
    const isClient = caseData.clientId === partyId;
    const isCounterpart = caseData.counterpartId === partyId;

    if (!isClient && !isCounterpart) {
      return NextResponse.json(
        { error: 'La parte no pertenece a este caso' },
        { status: 400 }
      );
    }

    // Desvincular del caso primero
    await prisma.case.update({
      where: { id },
      data: isClient ? { clientId: null } : { counterpartId: null },
    });

    // Luego eliminar la parte
    await prisma.caseParty.delete({ where: { id: partyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar parte del caso:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al eliminar la parte del caso', detail: message },
      { status: 500 }
    );
  }
}
