import { NextResponse } from 'next/server';

export function apiError(module: string, fn: string, message: string, status = 500) {
  console.error(`[${module}.${fn}] ${message}`);
  return NextResponse.json({ error: message }, { status });
}

export function apiForbidden(permission: string) {
  return NextResponse.json({ error: `Nincs jogosultságod: ${permission}` }, { status: 403 });
}
