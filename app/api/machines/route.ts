import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listMachines, createMachine } from '../../../modules/machines/machines.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'machine.view');
  if (auth instanceof NextResponse) return auth;
  const search = req.nextUrl.searchParams.get('q') || undefined;
  const machines = await listMachines(search);
  return NextResponse.json({ data: machines });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'machine.create');
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    if (!body.machineCode || !body.type) {
      return NextResponse.json({ error: 'Gép kód és típus kötelező' }, { status: 400 });
    }
    const machine = await createMachine(body, auth.user.id);
    return NextResponse.json({ data: machine }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gép létrehozása sikertelen' }, { status: 500 });
  }
}
