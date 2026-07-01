import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '../../../../modules/auth/auth.service';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email és jelszó szükséges' }, { status: 400 });
    }

    const result = await loginUser(email, password);
    if (!result) {
      return NextResponse.json({ error: 'Hibás email vagy jelszó' }, { status: 401 });
    }

    const response = NextResponse.json({ user: result.user, message: 'Sikeres bejelentkezés' });
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[auth.login] Hiba:', err);
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 });
  }
}
