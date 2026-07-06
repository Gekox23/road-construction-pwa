import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';
import { writeAuditLog } from '../../../../shared/utils/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'issue.view');
  if (auth instanceof NextResponse) return auth;
  const res = await db.query(
    `SELECT i.*, m.type as machine_type, s.name as site_name, u.name as reporter_name
     FROM issues i
     LEFT JOIN machines m ON i.machine_id = m.id
     LEFT JOIN sites s ON i.site_id = s.id
     LEFT JOIN users u ON i.reported_by = u.id
     WHERE i.id = $1`,
    [params.id]
  );
  if (!res.rows[0]) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json({ data: res.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'issue.resolve');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `UPDATE issues SET status=$1, resolved_by=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
    [body.status, body.status === 'megoldott' ? auth.user.id : null, params.id]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'issues', functionName: 'updateIssue', eventType: 'UPDATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] });
}
