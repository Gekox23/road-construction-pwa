import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/modules/auth/auth.service';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json({ success: false, error: 'Nincs refresh token' }, { status: 401 });
  }
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Lejárt session' }, { status: 401 });
  }
  const newAccessToken = signAccessToken({ sub: payload.sub, email: payload.email });
  const res = NextResponse.json({ success: true });
  res.cookies.set('access_token', newAccessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 60 * 15,
  });
  return res;
}
