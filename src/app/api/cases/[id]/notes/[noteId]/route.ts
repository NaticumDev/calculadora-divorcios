import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { noteId } = await params;

    await prisma.caseNote.delete({ where: { id: noteId } });

    return NextResponse.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la nota' },
      { status: 500 }
    );
  }
}
