export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/agenda
 *
 * Devuelve la información operativa diaria del abogado:
 * - Audiencias próximas (PROGRAMADA, próximos 30 días) con datos del caso
 * - Tareas vencidas (no completadas, dueDate < hoy)
 * - Tareas por vencer (no completadas, dueDate dentro de 7 días)
 * - Casos sin actualizar en más de 30 días (activos)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const in7Days = new Date(startOfToday);
    in7Days.setDate(in7Days.getDate() + 7);
    const in30Days = new Date(startOfToday);
    in30Days.setDate(in30Days.getDate() + 30);
    const minus30Days = new Date(startOfToday);
    minus30Days.setDate(minus30Days.getDate() - 30);

    // Audiencias próximas (programadas, fecha desde hoy hasta +30 días)
    const upcomingHearings = await prisma.hearing.findMany({
      where: {
        status: 'PROGRAMADA',
        date: { gte: startOfToday, lte: in30Days },
        case: { status: { not: 'ARCHIVADO' } },
      },
      orderBy: { date: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: { select: { fullName: true } },
          },
        },
      },
    });

    // Tareas vencidas (sin completar, dueDate < hoy)
    const overdueTasks = await prisma.caseTask.findMany({
      where: {
        isCompleted: false,
        dueDate: { lt: startOfToday, not: null },
        case: { status: { not: 'ARCHIVADO' } },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: { select: { fullName: true } },
          },
        },
      },
    });

    // Tareas por vencer (sin completar, dueDate entre hoy y +7 días)
    const upcomingTasks = await prisma.caseTask.findMany({
      where: {
        isCompleted: false,
        dueDate: { gte: startOfToday, lte: in7Days },
        case: { status: { not: 'ARCHIVADO' } },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: { select: { fullName: true } },
          },
        },
      },
    });

    // Casos activos sin actualizar en más de 30 días
    const staleCases = await prisma.case.findMany({
      where: {
        status: 'ACTIVO',
        updatedAt: { lt: minus30Days },
      },
      orderBy: { updatedAt: 'asc' },
      select: {
        id: true,
        caseNumber: true,
        stage: true,
        updatedAt: true,
        client: { select: { fullName: true } },
      },
    });

    return NextResponse.json({
      upcomingHearings,
      overdueTasks,
      upcomingTasks,
      staleCases,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Error al obtener agenda:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al obtener la agenda', detail: message },
      { status: 500 }
    );
  }
}
