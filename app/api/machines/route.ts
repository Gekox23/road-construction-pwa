import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import db from '../../../shared/db/client';
import { writeAuditLog } from '../../../shared/utils/audit';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'machine.view');
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId');
  const status = searchParams.get('status');
  let query = `SELECT m.*, s.name as site_name FROM machines m LEFT JOIN sites s ON m.current_site_id = s.id WHERE 1=1`;
  const values: unknown[] = [];
  let idx = 1;
  if (siteId) { query += ` AND m.current_site_id=$${idx++}`; values.push(siteId); }
  if (status) { query += ` AND m.status=$${idx++}`; values.push(status); }
  query += ` ORDER BY m.created_at DESC`;
  const res = await db.query(query, values);
  return NextResponse.json({ data: res.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'machine.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `INSERT INTO machines (type, machine_code, brand, year_of_manufacture, license_plate, current_site_id, operator_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'aktiv') RETURNING *`,
    [body.type, body.machineCode, body.brand || null, body.yearOfManufacture ? parseInt(body.yearOfManufacture) : null,
     body.licensePlate || null, body.currentSiteId || null, body.operatorId || null]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'machines', functionName: 'createMachine', eventType: 'CREATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] }, { status: 201 });
}
