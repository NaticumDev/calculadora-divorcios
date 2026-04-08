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

    const tasks = await prisma.caseTask.findMany({
      where: { caseId: id },
      orderBy: [{ isCompleted: 'asc' }, { priority: 'asc' }, { dueDate: 'asc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las tareas del caso' },
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

    const task = await prisma.caseTask.create({
      data: {
        caseId: id,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        isCompleted: body.isCompleted ?? false,
        priority: body.priority ?? 2,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear la tarea' },
      { status: 500 }
    );
  }
}
