import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      respondentName,
      respondentEmail,
      easeOfUse,
      accuracyRating,
      mostUsefulSection,
      wouldRecommend,
      additionalComments,
    } = body;

    if (!easeOfUse || !accuracyRating || !mostUsefulSection || !wouldRecommend) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben ser completados." },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedbackResponse.create({
      data: {
        respondentName: respondentName || null,
        respondentEmail: respondentEmail || null,
        easeOfUse: Math.min(5, Math.max(1, easeOfUse)),
        accuracyRating: Math.min(5, Math.max(1, accuracyRating)),
        mostUsefulSection,
        wouldRecommend,
        additionalComments: additionalComments || null,
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Error al guardar la retroalimentación." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const responses = await prisma.feedbackResponse.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Error al obtener retroalimentación." },
      { status: 500 }
    );
  }
}
