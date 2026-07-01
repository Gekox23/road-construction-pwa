import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../modules/auth/auth.middleware';
import { addHourLog } from '../../../../../modules/machines/machines.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.hour_log');
  if (auth instanceof NextResponse) return auth;
  const { eventDate, hourValue, photoUrl, notes } = await req.json();
  if (!eventDate || hourValue === undefined) {
    return NextResponse.json({ error: 'Dátum és óraállás szükséges' }, { status: 400 });
  }
  const log = await addHourLog(params.id, eventDate, hourValue, photoUrl || null, notes || null, auth.user.id);
  return NextResponse.json({ data: log }, { status: 201 });
}
