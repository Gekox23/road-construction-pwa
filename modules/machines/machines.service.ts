import db from '../../shared/db/client';
import { writeAuditLog } from '../../shared/utils/audit';
import type { Machine } from '../../shared/types';
import type { MachineRow, MachineHourLogRow, MachineFuelLogRow, WorkOrderRow } from '../../shared/types/db-rows';

export async function listMachines(search?: string): Promise<MachineRow[]> {
  try {
    if (search) {
      const res = await db.query<MachineRow>(
        `SELECT * FROM machines WHERE status != 'archivalt'
         AND (machine_code ILIKE $1 OR type ILIKE $1 OR manufacturer ILIKE $1)
         ORDER BY type, machine_code LIMIT 100`,
        [`%${search}%`]
      );
      return res.rows;
    }
    const res = await db.query<MachineRow>(
      `SELECT m.*, s.name as site_name, u.name as operator_name
       FROM machines m
       LEFT JOIN sites s ON m.current_site_id = s.id
       LEFT JOIN users u ON m.current_operator_id = u.id
       WHERE m.status != 'archivalt'
       ORDER BY m.type, m.machine_code`
    );
    return res.rows;
  } catch (err) {
    console.error('[machines.listMachines] Hiba:', err);
    return [];
  }
}

export async function getMachine(id: string): Promise<MachineRow | null> {
  try {
    const res = await db.query<MachineRow>(
      `SELECT m.*, s.name as site_name, u.name as operator_name
       FROM machines m
       LEFT JOIN sites s ON m.current_site_id = s.id
       LEFT JOIN users u ON m.current_operator_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.error('[machines.getMachine] Hiba:', err);
    return null;
  }
}

export async function createMachine(data: Partial<Machine>, userId: string): Promise<MachineRow> {
  try {
    const res = await db.query<MachineRow>(
      `INSERT INTO machines (machine_code, type, manufacturer, model, year, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.machineCode, data.type, data.manufacturer || null, data.model || null, data.year || null, data.notes || null]
    );
    await writeAuditLog({ userId, module: 'machines', functionName: 'createMachine', eventType: 'CREATE', newValue: res.rows[0] });
    return res.rows[0];
  } catch (err) {
    console.error('[machines.createMachine] Hiba:', err);
    throw err;
  }
}

export async function updateMachine(id: string, data: Partial<Machine>, userId: string): Promise<MachineRow> {
  try {
    const old = await getMachine(id);
    const res = await db.query<MachineRow>(
      `UPDATE machines SET type=$1, manufacturer=$2, model=$3, year=$4, notes=$5, status=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [data.type, data.manufacturer || null, data.model || null, data.year || null, data.notes || null, data.status, id]
    );
    await writeAuditLog({ userId, module: 'machines', functionName: 'updateMachine', eventType: 'UPDATE', oldValue: old, newValue: res.rows[0] });
    return res.rows[0];
  } catch (err) {
    console.error('[machines.updateMachine] Hiba:', err);
    throw err;
  }
}

export async function addHourLog(machineId: string, eventDate: string, hourValue: number, photoUrl: string | null, notes: string | null, userId: string): Promise<MachineHourLogRow> {
  try {
    const res = await db.query<MachineHourLogRow>(
      `INSERT INTO machine_hour_logs (machine_id, event_date, hour_value, photo_url, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [machineId, eventDate, hourValue, photoUrl, notes, userId]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[machines.addHourLog] Hiba:', err);
    throw err;
  }
}

export async function addFuelLog(machineId: string, eventDate: string, liters: number, location: string | null, userId: string): Promise<MachineFuelLogRow> {
  try {
    const res = await db.query<MachineFuelLogRow>(
      `INSERT INTO machine_fuel_logs (machine_id, event_date, liters, location, recorded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [machineId, eventDate, liters, location, userId]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[machines.addFuelLog] Hiba:', err);
    throw err;
  }
}

export async function getMachineHistory(machineId: string) {
  try {
    const [hours, fuel, workorders] = await Promise.all([
      db.query<MachineHourLogRow>('SELECT * FROM machine_hour_logs WHERE machine_id=$1 ORDER BY event_date DESC', [machineId]),
      db.query<MachineFuelLogRow>('SELECT * FROM machine_fuel_logs WHERE machine_id=$1 ORDER BY event_date DESC', [machineId]),
      db.query<WorkOrderRow>('SELECT * FROM workorders WHERE machine_id=$1 ORDER BY event_date DESC', [machineId]),
    ]);
    return { hourLogs: hours.rows, fuelLogs: fuel.rows, workorders: workorders.rows };
  } catch (err) {
    console.error('[machines.getMachineHistory] Hiba:', err);
    throw err;
  }
}
