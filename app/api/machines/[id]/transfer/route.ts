import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../modules/auth/auth.middleware';
import db from '../../../../../shared/db/client';
import { writeAuditLog } from '../../../../../shared/utils/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'machine.transfer');
  if (auth instanceof NextResponse) return auth;

  const { targetSiteId, operatorId, notes } = await req.json();

  try {
    // Lezárjuk a korábbi site_machines rekordot
    await db.query(
      `UPDATE site_machines SET removed_at = NOW() WHERE machine_id = $1 AND removed_at IS NULL`,
      [params.id]
    );

    // Új status
    const newStatus = targetSiteId ? 'epitkezesen' : 'raktaron';
    await db.query(
      `UPDATE machines SET current_site_id = $1, current_operator_id = $2, status = $3, updated_at = NOW() WHERE id = $4`,
      [targetSiteId || null, operatorId || null, newStatus, params.id]
    );

    // Új site_machines rekord (ha van célépítkezés)
    if (targetSiteId) {
      await db.query(
        `INSERT INTO site_machines (site_id, machine_id) VALUES ($1, $2)`,
        [targetSiteId, params.id]
      );
    }

    await writeAuditLog({
      userId: auth.user.id,
      module: 'machines',
      functionName: 'transferMachine',
      eventType: 'TRANSFER',
      newValue: { machineId: params.id, targetSiteId, operatorId, notes },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[machine.transfer] Hiba:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
