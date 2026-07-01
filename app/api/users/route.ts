import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listUsers, createUser } from '../../../modules/users/users.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'user.view');
  if (auth instanceof NextResponse) return auth;
  const users = await listUsers();
  return NextResponse.json({ data: users });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'user.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.email || !body.name || !body.password) {
    return NextResponse.json({ error: 'Email, név és jelszó szükséges' }, { status: 400 });
  }
  try {
    const user = await createUser(body, auth.user.id);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Felhasználó létrehozás sikertelen (email már foglalt?)' }, { status: 409 });
  }
}
