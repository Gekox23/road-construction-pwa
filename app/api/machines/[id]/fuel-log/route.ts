import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../modules/auth/auth.middleware';
import { addFuelLog } from '../../../../../modules/machines/machines.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.fuel_log');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.liters || !body.eventDate) {
    return NextResponse.json({ error: 'Literérték és dátum kötelező' }, { status: 400 });
  }
  try {
    const log = await addFuelLog(params.id, body.eventDate, body.liters, body.location || null, auth.user.id);
    return NextResponse.json({ data: log }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
