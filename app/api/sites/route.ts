import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listAllSites, listOwnSites, createSite } from '../../../modules/sites/sites.service';
import { hasPermission } from '../../../shared/utils/permissions';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const own = req.nextUrl.searchParams.get('own') === 'true';
  if (own && hasPermission(auth.user, 'site.view_own')) {
    const sites = await listOwnSites(auth.user.id);
    return NextResponse.json({ data: sites });
  }
  if (!hasPermission(auth.user, 'site.view')) {
    return NextResponse.json({ error: 'Nincs jogosultságod: site.view' }, { status: 403 });
  }
  const sites = await listAllSites();
  return NextResponse.json({ data: sites });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'site.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: 'Név kötelező' }, { status: 400 });
  const site = await createSite(body, auth.user.id);
  return NextResponse.json({ data: site }, { status: 201 });
}
