import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      priority: body.priority,
      isCompleted: body.isCompleted,
    };

    // If marking as completed, set completedAt
    if (body.isCompleted === true) {
      data.completedAt = new Date();
    } else if (body.isCompleted === false) {
      data.completedAt = null;
    }

    const task = await prisma.caseTask.update({
      where: { id: taskId },
      data,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la tarea' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId } = await params;

    await prisma.caseTask.delete({ where: { id: taskId } });

    return NextResponse.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la tarea' },
      { status: 500 }
    );
  }
}
