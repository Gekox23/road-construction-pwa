import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import { getMachine, updateMachine } from '../../../../modules/machines/machines.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.view');
  if (auth instanceof NextResponse) return auth;
  const machine = await getMachine(params.id);
  if (!machine) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json({ data: machine });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.edit');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  try {
    const updated = await updateMachine(params.id, body, auth.user.id);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
