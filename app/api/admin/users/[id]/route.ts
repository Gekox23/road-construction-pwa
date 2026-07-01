import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../modules/auth/auth.service';
import db from '../../../../../shared/db/client';

function getUser(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// PATCH /api/admin/users/[id] — update permissions / active
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const caller = getUser(req);
  if (!caller || !caller.permissions.includes('user.edit' as never)) {
    return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 });
  }
  const { permissions, active, name } = await req.json();
  const id = params.id;

  if (active !== undefined) {
    await db.query('UPDATE users SET active = $1, updated_at = NOW() WHERE id = $2', [active, id]);
  }
  if (name !== undefined) {
    await db.query('UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2', [name, id]);
  }
  if (permissions !== undefined) {
    await db.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);
    if (permissions.length) {
      const vals = permissions.map((_: string, i: number) => `($1, $${i + 2}, true)`).join(',');
      await db.query(`INSERT INTO user_permissions (user_id, permission_key, granted) VALUES ${vals}`, [id, ...permissions]);
    }
  }
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/users/[id] — deactivate
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const caller = getUser(req);
  if (!caller || !caller.permissions.includes('user.edit' as never)) {
    return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 });
  }
  await db.query('UPDATE users SET active = false, updated_at = NOW() WHERE id = $1', [params.id]);
  return NextResponse.json({ success: true });
}
