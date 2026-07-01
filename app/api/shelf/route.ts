import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listShelfItems } from '../../../modules/shelf/shelf.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'shelf.view');
  if (auth instanceof NextResponse) return auth;
  const search = req.nextUrl.searchParams.get('q') || undefined;
  const items = await listShelfItems(search);
  return NextResponse.json({ data: items });
}
