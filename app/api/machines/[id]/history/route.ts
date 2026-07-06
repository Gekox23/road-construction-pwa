import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../modules/auth/auth.middleware';
import { getMachineHistory } from '../../../../../modules/machines/machines.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.view');
  if (auth instanceof NextResponse) return auth;
  const history = await getMachineHistory(params.id);
  return NextResponse.json({ data: history });
}
