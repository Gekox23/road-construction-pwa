import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import { scanIn } from '../../../../modules/shelf/shelf.service';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'shelf.scan_in');
  if (auth instanceof NextResponse) return auth;
  const { qrCode, quantityUsedPercent } = await req.json();
  if (!qrCode) return NextResponse.json({ error: 'QR kód szükséges' }, { status: 400 });
  try {
    const item = await scanIn(qrCode, auth.user.id, quantityUsedPercent);
    return NextResponse.json({ data: item });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
