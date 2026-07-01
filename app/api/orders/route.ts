import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import { listOrders, createOrder } from '../../../modules/orders/orders.service';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'order.view');
  if (auth instanceof NextResponse) return auth;
  const status = req.nextUrl.searchParams.get('status') || undefined;
  const list = await listOrders(status);
  return NextResponse.json({ data: list });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'order.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.items?.length || !body.eventDate) {
    return NextResponse.json({ error: 'Tételek és dátum szükséges' }, { status: 400 });
  }
  const order = await createOrder(body, auth.user.id);
  return NextResponse.json({ data: order }, { status: 201 });
}
