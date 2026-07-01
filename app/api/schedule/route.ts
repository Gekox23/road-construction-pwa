import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { getScheduleForWeek, upsertScheduleEntry } from '../../../modules/schedule/schedule.service';
import { getWeekStart } from '../../../shared/utils/date';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'schedule.view');
  if (auth instanceof NextResponse) return auth;
  const weekParam = req.nextUrl.searchParams.get('week');
  const weekStart = weekParam || getWeekStart().toISOString().split('T')[0];
  const entries = await getScheduleForWeek(weekStart);
  return NextResponse.json({ data: entries });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'schedule.edit');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const entry = await upsertScheduleEntry(body, auth.user.id);
  return NextResponse.json({ data: entry }, { status: 201 });
}
