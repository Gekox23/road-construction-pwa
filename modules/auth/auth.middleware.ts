// =============================================================
// AUTH MODUL – auth.middleware.ts
// Felelősség: API route-ok védelme, jogosultság-ellenőrzés
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth.service';
import { query } from '@/shared/db';
import type { PermissionKey } from '@/shared/types';
import { logError } from '@/shared/utils/errors';

const MODULE = 'auth';

export interface AuthContext {
  userId: string;
  email: string;
  permissions: PermissionKey[];
}

/** API route védő: autentikáció + opcionális jogosultság-ellenőrzés */
export async function withAuth(
  req: NextRequest,
  handler: (ctx: AuthContext, req: NextRequest) => Promise<NextResponse>,
  requiredPermission?: PermissionKey
): Promise<NextResponse> {
  try {
    const cookie = req.cookies.get('access_token')?.value;
    const header = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookie ?? header;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Nincs bejelentkezve' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Érvénytelen token' }, { status: 401 });
    }

    // Jogosultságok az adatbázisból (friss, nem cached)
    const res = await query<{ permission_key: string; granted: boolean }>(
      'SELECT permission_key, granted FROM user_permissions WHERE user_id = $1',
      [payload.sub]
    );
    const permissions = res.rows
      .filter(r => r.granted)
      .map(r => r.permission_key as PermissionKey);

    if (requiredPermission && !permissions.includes(requiredPermission)) {
      return NextResponse.json({ success: false, error: 'Nincs jogosultság' }, { status: 403 });
    }

    return handler({ userId: payload.sub, email: payload.email, permissions }, req);
  } catch (err) {
    logError({ module: MODULE, fn: 'withAuth', message: 'Middleware hiba', cause: err });
    return NextResponse.json({ success: false, error: 'Szerverhiba' }, { status: 500 });
  }
}

/** Szuperuser védelem – gekox1111@gmail.com soha nem deaktiválható */
export function isSuperuser(email: string): boolean {
  return email.toLowerCase() === 'gekox1111@gmail.com';
}
