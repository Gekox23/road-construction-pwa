import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../shared/db/client';
import type { SessionUser, Permission } from '../../shared/types';

const SUPERUSER_EMAIL = 'gekox1111@gmail.com';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  active: boolean;
}

export async function loginUser(email: string, password: string): Promise<{ user: SessionUser; accessToken: string; refreshToken: string } | null> {
  try {
    const result = await db.query<UserRow>(
      'SELECT id, email, name, password_hash, active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !user.active) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const permsResult = await db.query<{ permission_key: string }>(
      'SELECT permission_key FROM user_permissions WHERE user_id = $1 AND granted = TRUE',
      [user.id]
    );
    const permissions = permsResult.rows.map((r) => r.permission_key) as Permission[];

    // Superuser kap minden jogosultságot
    const isSuperuser = isSuperUser(user.email);
    const allPerms: Permission[] = isSuperuser
      ? [
          'schedule.view', 'schedule.edit',
          'machine.view', 'machine.edit',
          'shelf.view', 'shelf.edit',
          'site.view', 'site.edit',
          'workorder.view', 'workorder.edit',
          'issue.view', 'issue.edit',
          'order.view', 'order.edit',
          'finance.view', 'finance.edit',
          'user.view', 'user.edit',
        ] as Permission[]
      : permissions;

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions: allPerms,
    };

    // FIX: permissions benne van a JWT payloadban
    const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name, permissions: allPerms });
    const refreshToken = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    return { user: sessionUser, accessToken, refreshToken };
  } catch (err) {
    console.error('[auth.loginUser] Hiba:', err);
    return null;
  }
}

export function signAccessToken(payload: { sub: string; email: string; name?: string; permissions?: Permission[] }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; name: string; permissions?: Permission[] };
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? '',
      permissions: decoded.permissions ?? [],
    };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
  } catch {
    return null;
  }
}

export function isSuperUser(email: string): boolean {
  return email.toLowerCase() === SUPERUSER_EMAIL.toLowerCase();
}
