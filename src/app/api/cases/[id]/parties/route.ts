import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { isClient, fullName, curp, rfc, address, phone, email, occupation, monthlyIncome, birthDate } = body;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
    }

    const partyData = {
      fullName,
      curp,
      rfc,
      address,
      phone,
      email,
      occupation,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
      birthDate: birthDate ? new Date(birthDate) : null,
    };

    const existingPartyId = isClient ? caseData.clientId : caseData.counterpartId;

    let party;

    if (existingPartyId) {
      // Update existing party
      party = await prisma.caseParty.update({
        where: { id: existingPartyId },
        data: partyData,
      });
    } else {
      // Create new party and link to case
      party = await prisma.caseParty.create({
        data: partyData,
      });

      await prisma.case.update({
        where: { id },
        data: isClient
          ? { clientId: party.id }
          : { counterpartId: party.id },
      });
    }

    return NextResponse.json(party, { status: existingPartyId ? 200 : 201 });
  } catch (error) {
    console.error('Error al gestionar parte del caso:', error);
    return NextResponse.json(
      { error: 'Error al gestionar la parte del caso' },
      { status: 500 }
    );
  }
}
