// =============================================================
// AUTH MODUL – auth.service.ts
// Felelősség: JWT generálás, refresh, session kezelés
// FONTOS: Ez a modul NEM importál más modulokat.
//         Minden adat az adatbázisból olvasódik (shared/db).
// =============================================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '@/shared/db';
import { logError } from '@/shared/utils/errors';
import type { PermissionKey } from '@/shared/types';

const MODULE = 'auth';
const ACCESS_TTL  = '15m';
const REFRESH_TTL = '365d'; // persistent session – 1 év

export interface TokenPayload {
  sub: string;        // user id
  email: string;
  iat?: number;
  exp?: number;
}

// ── Jelszó hash ──────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT ──────────────────────────────────────────────────────
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TTL });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (err) {
    logError({ module: MODULE, fn: 'verifyAccessToken', message: 'Érvénytelen access token', cause: err });
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
  } catch (err) {
    logError({ module: MODULE, fn: 'verifyRefreshToken', message: 'Érvénytelen refresh token', cause: err });
    return null;
  }
}

// ── Bejelentkezés ─────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  try {
    const res = await query<{ id: string; email: string; name: string; password_hash: string; is_active: boolean }>(
      'SELECT id, email, name, password_hash, is_active FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    const user = res.rows[0];
    if (!user) return { success: false, error: 'Hibás email vagy jelszó' };
    if (!user.is_active) return { success: false, error: 'A fiók inaktív' };

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return { success: false, error: 'Hibás email vagy jelszó' };

    // Utolsó belépés frissítése
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const payload: TokenPayload = { sub: user.id, email: user.email };
    return {
      success: true,
      accessToken:  signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  } catch (err) {
    logError({ module: MODULE, fn: 'loginUser', message: 'DB hiba bejelentkezésnél', cause: err });
    return { success: false, error: 'Szerverhiba' };
  }
}

// ── Jogosultságok lekérése ────────────────────────────────────
export async function getUserPermissions(userId: string): Promise<PermissionKey[]> {
  try {
    const res = await query<{ permission_key: string; granted: boolean }>(
      'SELECT permission_key, granted FROM user_permissions WHERE user_id = $1',
      [userId]
    );
    return res.rows
      .filter(r => r.granted)
      .map(r => r.permission_key as PermissionKey);
  } catch (err) {
    logError({ module: MODULE, fn: 'getUserPermissions', message: `DB hiba: userId=${userId}`, cause: err });
    return [];
  }
}
