import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAuthFromRequest } from '@/lib/middleware-auth';
import { CVStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contracts } = body;

    if (!contracts || !Array.isArray(contracts) || contracts.length === 0) {
      return NextResponse.json({ error: 'Contracts data is required' }, { status: 400 });
    }

    const cvIdsToUpdate = contracts.map(c => Number(c.cvId));

    // Use a transaction to ensure atomicity
    const result = await db.$transaction(async (prisma) => {
      // 1. Create all contracts
      await prisma.contract.createMany({
        data: contracts.map((c: { cvId: string; identityNumber: string }) => ({
          cvId: Number(c.cvId),
          identityNumber: c.identityNumber,
        })),
        skipDuplicates: true, // In case a contract for a CV already exists
      });

      // 2. Update status of all CVs to HIRED
      const updateResult = await prisma.cV.updateMany({
        where: {
          id: { in: cvIdsToUpdate },
        },
        data: {
          status: CVStatus.HIRED,
          updatedById: authResult.user?.id
        },
      });

      return updateResult;
    });

    return NextResponse.json({ message: 'Bulk contracts created successfully', updatedCount: result.count });

  } catch (error) {
    console.error('Error in bulk contract creation:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk contracts' },
      { status: 500 }
    );
  }
}
