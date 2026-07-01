import { NextResponse } from 'next/server';

// Ez a fajl torolve / deaktivalva
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
