import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';
import { writeAuditLog } from '../../../../shared/utils/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.view');
  if (auth instanceof NextResponse) return auth;
  const res = await db.query(
    `SELECT m.*, s.name as site_name FROM machines m LEFT JOIN sites s ON m.current_site_id = s.id WHERE m.id = $1`,
    [params.id]
  );
  if (!res.rows[0]) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json({ data: res.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.edit');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `UPDATE machines SET type=$1, machine_code=$2, brand=$3, year_of_manufacture=$4, license_plate=$5,
     current_site_id=$6, operator_id=$7, status=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
    [body.type, body.machineCode, body.brand || null,
     body.yearOfManufacture ? parseInt(body.yearOfManufacture) : null,
     body.licensePlate || null, body.currentSiteId || null, body.operatorId || null,
     body.status || 'aktiv', params.id]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'machines', functionName: 'updateMachine', eventType: 'UPDATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] });
}
