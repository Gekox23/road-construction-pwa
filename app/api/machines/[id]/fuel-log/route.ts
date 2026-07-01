import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../modules/auth/auth.middleware';
import { addFuelLog } from '../../../../../modules/machines/machines.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.fuel_log');
  if (auth instanceof NextResponse) return auth;
  const { eventDate, liters, location } = await req.json();
  if (!eventDate || !liters) {
    return NextResponse.json({ error: 'Dátum és liter szükséges' }, { status: 400 });
  }
  const log = await addFuelLog(params.id, eventDate, liters, location || null, auth.user.id);
  return NextResponse.json({ data: log }, { status: 201 });
}
