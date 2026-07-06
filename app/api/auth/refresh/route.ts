import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, isSuperUser, ALL_PERMISSIONS } from '@/modules/auth/auth.service';
import db from '@/shared/db/client';
import type { Permission } from '@/shared/types';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json({ success: false, error: 'Nincs refresh token' }, { status: 401 });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Lejárt session' }, { status: 401 });
  }

  // Friss permissionök lekérése DB-ből (superuser esetén ALL_PERMISSIONS)
  let permissions: Permission[];
  if (isSuperUser(payload.email)) {
    permissions = ALL_PERMISSIONS;
  } else {
    const permsResult = await db.query<{ permission_key: string }>(
      'SELECT permission_key FROM user_permissions WHERE user_id = $1 AND granted = TRUE',
      [payload.sub]
    );
    permissions = permsResult.rows.map((r) => r.permission_key) as Permission[];
  }

  // Felhasználó neve
  const userResult = await db.query<{ name: string }>(
    'SELECT name FROM users WHERE id = $1',
    [payload.sub]
  );
  const name = userResult.rows[0]?.name ?? '';

  const newAccessToken = signAccessToken({
    sub: payload.sub,
    email: payload.email,
    name,
    permissions,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set('access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });
  return res;
}
