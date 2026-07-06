import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import db from '../../../shared/db/client';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'user.list');
  if (auth instanceof NextResponse) return auth;
  const res = await db.query(`SELECT id, name, email, role FROM users WHERE is_active = true ORDER BY name`);
  return NextResponse.json({ data: res.rows });
}
