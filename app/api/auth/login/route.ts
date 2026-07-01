// =============================================================
// API ROUTE: POST /api/auth/login
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/modules/auth/auth.service';
import { emailSchema, passwordSchema } from '@/shared/utils/validation';
import { logError } from '@/shared/utils/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const emailParsed = emailSchema.safeParse(body.email);
    const passParsed  = passwordSchema.safeParse(body.password);

    if (!emailParsed.success || !passParsed.success) {
      return NextResponse.json({ success: false, error: 'Hibás email vagy jelszó formátum' }, { status: 400 });
    }

    const result = await loginUser(emailParsed.data, passParsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, user: result.user });

    // HttpOnly cookie – persistent session, 1 év
    res.cookies.set('access_token', result.accessToken!, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: 60 * 15,
    });
    res.cookies.set('refresh_token', result.refreshToken!, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/api/auth/refresh', maxAge: 60 * 60 * 24 * 365,
    });

    return res;
  } catch (err) {
    logError({ module: 'auth', fn: 'login_route', message: 'Váratlan hiba', cause: err });
    return NextResponse.json({ success: false, error: 'Szerverhiba' }, { status: 500 });
  }
}
