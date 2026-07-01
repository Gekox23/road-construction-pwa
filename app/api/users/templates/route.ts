import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import { listTemplates } from '../../../../modules/users/users.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'user.view');
  if (auth instanceof NextResponse) return auth;
  const templates = await listTemplates();
  return NextResponse.json({ data: templates });
}
