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

    const response = NextResponse.json({
      user: result.user,
      message: 'Sikeres bejelentkezés',
    });

    // Access token: 15 perc
    response.cookies.set('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15,
      path: '/',
    });

    // FIX: Refresh token: 1 év (365 nap) – session soha ne járjon le az eszközön
    response.cookies.set('refresh_token', result.refreshToken, {
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
