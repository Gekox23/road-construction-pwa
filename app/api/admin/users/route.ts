import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../modules/auth/auth.service';
import db from '../../../../shared/db/client';
import bcrypt from 'bcryptjs';

function getUser(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/admin/users — list all users
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user || !user.permissions.includes('user.view' as never)) {
    return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 });
  }
  const result = await db.query(
    `SELECT u.id, u.email, u.name, u.active, u.last_login_at, u.created_at,
      ARRAY_AGG(up.permission_key) FILTER (WHERE up.granted = true) AS permissions
     FROM users u
     LEFT JOIN user_permissions up ON up.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at ASC`
  );
  return NextResponse.json({ users: result.rows });
}

// POST /api/admin/users — create user
export async function POST(req: NextRequest) {
  const caller = getUser(req);
  if (!caller || !caller.permissions.includes('user.create' as never)) {
    return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 });
  }
  const { email, name, password, permissions } = await req.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: 'Hiányzó adatok' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 12);
  const newUser = await db.query(
    `INSERT INTO users (email, name, password_hash, active) VALUES ($1, $2, $3, true) RETURNING id`,
    [email.toLowerCase().trim(), name, hash]
  );
  const userId = newUser.rows[0].id;
  if (permissions?.length) {
    const vals = permissions.map((_: string, i: number) => `($1, $${i + 2}, true)`).join(',');
    await db.query(`INSERT INTO user_permissions (user_id, permission_key, granted) VALUES ${vals}`, [userId, ...permissions]);
  }
  return NextResponse.json({ success: true, id: userId });
}
