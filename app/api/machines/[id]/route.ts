import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import { getMachine, updateMachine, getMachineHistory } from '../../../../modules/machines/machines.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.view');
  if (auth instanceof NextResponse) return auth;
  const machine = await getMachine(params.id);
  if (!machine) return NextResponse.json({ error: 'Gép nem található' }, { status: 404 });
  const history = await getMachineHistory(params.id);
  return NextResponse.json({ data: { ...machine, ...history } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.edit');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const updated = await updateMachine(params.id, body, auth.user.id);
  return NextResponse.json({ data: updated });
}
