import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/cases/[id]/parties
 *
 * Upsert de la parte (cliente o contraparte) del caso.
 * Acepta tanto `role: "client"|"counterpart"` (forma del frontend)
 * como `isClient: boolean` (compatibilidad).
 */
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
    const {
      role,
      isClient,
      fullName,
      curp,
      rfc,
      address,
      phone,
      email,
      occupation,
      monthlyIncome,
      birthDate,
    } = body;

    // Normalizar el rol — aceptamos role o isClient
    let isClientResolved: boolean | null = null;
    if (typeof isClient === 'boolean') {
      isClientResolved = isClient;
    } else if (role === 'client') {
      isClientResolved = true;
    } else if (role === 'counterpart') {
      isClientResolved = false;
    }

    if (isClientResolved === null) {
      return NextResponse.json(
        { error: 'Falta el rol de la parte (role: "client" | "counterpart")' },
        { status: 400 }
      );
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { error: 'El nombre completo es obligatorio' },
        { status: 400 }
      );
    }

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
    }

    const partyData = {
      fullName: fullName.trim(),
      curp: curp || null,
      rfc: rfc || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      occupation: occupation || null,
      monthlyIncome:
        monthlyIncome !== null && monthlyIncome !== undefined && monthlyIncome !== ''
          ? parseFloat(String(monthlyIncome))
          : null,
      birthDate: birthDate ? new Date(birthDate) : null,
    };

    const existingPartyId = isClientResolved
      ? caseData.clientId
      : caseData.counterpartId;

    let party;

    if (existingPartyId) {
      party = await prisma.caseParty.update({
        where: { id: existingPartyId },
        data: partyData,
      });
    } else {
      party = await prisma.caseParty.create({ data: partyData });
      await prisma.case.update({
        where: { id },
        data: isClientResolved
          ? { clientId: party.id }
          : { counterpartId: party.id },
      });
    }

    return NextResponse.json(party, { status: existingPartyId ? 200 : 201 });
  } catch (error) {
    console.error('Error al gestionar parte del caso:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al gestionar la parte del caso', detail: message },
      { status: 500 }
    );
  }
}
