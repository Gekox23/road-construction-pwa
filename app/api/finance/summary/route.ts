import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'finance.view');
  if (auth instanceof NextResponse) return auth;
  try {
    const siteId = req.nextUrl.searchParams.get('siteId');
    const [machines, workorders, fuel] = await Promise.all([
      db.query(`SELECT m.type, m.machine_code,
        MIN(hl.hour_value) as hour_entry, MAX(hl.hour_value) as hour_exit,
        MAX(hl.hour_value) - MIN(hl.hour_value) as hours_spent
        FROM site_machines sm
        JOIN machines m ON sm.machine_id = m.id
        LEFT JOIN machine_hour_logs hl ON hl.machine_id = m.id
        WHERE ${siteId ? 'sm.site_id = $1' : '1=1'}
        GROUP BY m.id, m.type, m.machine_code`, siteId ? [siteId] : []),
      db.query(`SELECT w.event_date, w.work_type, u.name as worker
        FROM workorders w LEFT JOIN users u ON w.assigned_to = u.id
        WHERE w.status IN ('befejezve','lezarva')
        ${siteId ? 'AND w.machine_id IN (SELECT machine_id FROM site_machines WHERE site_id = $1)' : ''}
        ORDER BY w.event_date DESC`, siteId ? [siteId] : []),
      db.query(`SELECT SUM(fl.liters) as total_liters
        FROM machine_fuel_logs fl
        WHERE ${siteId ? 'fl.machine_id IN (SELECT machine_id FROM site_machines WHERE site_id = $1)' : '1=1'}`, siteId ? [siteId] : []),
    ]);
    return NextResponse.json({
      data: { machines: machines.rows, workorders: workorders.rows, totalFuelLiters: fuel.rows[0]?.total_liters || 0 }
    });
  } catch (err) {
    console.error('[finance.summary] Hiba:', err);
    return NextResponse.json({ error: 'Lekérdezés sikertelen' }, { status: 500 });
  }
}
