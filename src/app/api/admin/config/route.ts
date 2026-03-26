import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    // Upsert: fetch existing or create with defaults
    const config = await prisma.lawyerConfig.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuracion." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Remove id and updatedAt from the update payload
    const { id: _id, updatedAt: _updatedAt, ...updateData } = body;

    const config = await prisma.lawyerConfig.upsert({
      where: { id: "default" },
      update: updateData,
      create: { id: "default", ...updateData },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuracion." },
      { status: 500 }
    );
  }
}
