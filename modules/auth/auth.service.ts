import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../shared/db/client';
import type { SessionUser, Permission } from '../../shared/types';

const SUPERUSER_EMAIL = 'gekox1111@gmail.com';

export async function loginUser(email: string, password: string): Promise<{ user: SessionUser; token: string } | null> {
  try {
    const result = await db.query(
      'SELECT id, email, name, password_hash, active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !user.active) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const permsResult = await db.query(
      'SELECT permission_key FROM user_permissions WHERE user_id = $1 AND granted = TRUE',
      [user.id]
    );
    const permissions = permsResult.rows.map((r) => r.permission_key) as Permission[];

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions,
    };

    const token = jwt.sign(sessionUser, process.env.JWT_SECRET!, { expiresIn: '365d' });
    return { user: sessionUser, token };
  } catch (err) {
    console.error('[auth.loginUser] Hiba:', err);
    return null;
  }
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as SessionUser;
  } catch {
    return null;
  }
}

export function isSuperUser(email: string): boolean {
  return email.toLowerCase() === SUPERUSER_EMAIL.toLowerCase();
}
