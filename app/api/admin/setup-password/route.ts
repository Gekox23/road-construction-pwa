import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../shared/db/client';

// ONE-TIME USE — delete after first login!
// GET /api/admin/setup-password?secret=SETUP2026
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'SETUP2026') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const password = 'Admin1234!';
  const hash = await bcrypt.hash(password, 12);

  await db.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2',
    [hash, 'gekox1111@gmail.com']
  );

  return NextResponse.json({ ok: true, message: 'Jelszo frissitve. Torold ezt a fajlt!' });
}
