import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../modules/auth/auth.middleware';
import { setPermission } from '../../../../../modules/users/users.service';
import type { Permission } from '../../../../../shared/types';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'user.permission_grant');
  if (auth instanceof NextResponse) return auth;
  const { permissionKey, granted } = await req.json();
  try {
    await setPermission(params.id, permissionKey as Permission, granted, auth.user.id);
    return NextResponse.json({ message: 'Jogosultság frissítve' });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }
}
