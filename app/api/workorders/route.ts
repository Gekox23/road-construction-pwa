import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listWorkorders, createWorkorder } from '../../../modules/workorders/workorders.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'workorder.view');
  if (auth instanceof NextResponse) return auth;
  const p = req.nextUrl.searchParams;
  const list = await listWorkorders({
    machineId: p.get('machineId') || undefined,
    status: p.get('status') || undefined,
    dateFrom: p.get('dateFrom') || undefined,
    dateTo: p.get('dateTo') || undefined,
  });
  return NextResponse.json({ data: list });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'workorder.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.eventDate) return NextResponse.json({ error: 'Dátum kötelező' }, { status: 400 });
  const wo = await createWorkorder(body, auth.user.id);
  return NextResponse.json({ data: wo }, { status: 201 });
}
