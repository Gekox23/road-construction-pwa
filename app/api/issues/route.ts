import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listIssues, createIssue } from '../../../modules/issues/issues.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'issue.view');
  if (auth instanceof NextResponse) return auth;
  const status = req.nextUrl.searchParams.get('status') || undefined;
  const list = await listIssues(status);
  return NextResponse.json({ data: list });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'issue.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.description || !body.eventDate) {
    return NextResponse.json({ error: 'Leírás és dátum kötelező' }, { status: 400 });
  }
  const issue = await createIssue(body, auth.user.id);
  return NextResponse.json({ data: issue }, { status: 201 });
}
