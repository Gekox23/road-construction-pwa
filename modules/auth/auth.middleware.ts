import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth.service';
import type { Permission, SessionUser } from '../../shared/types';

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const cookie = req.cookies.get('auth_token');
  if (!cookie?.value) return null;
  return verifyToken(cookie.value);
}

export function requireAuth(
  req: NextRequest,
  permission?: Permission
): { user: SessionUser } | NextResponse {
  const user = getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Nem vagy bejelentkezve' }, { status: 401 });
  }
  if (permission && !user.permissions.includes(permission)) {
    return NextResponse.json({ error: `Nincs jogosultságod: ${permission}` }, { status: 403 });
  }
  return { user };
}
