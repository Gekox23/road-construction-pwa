import db from './client';
import bcrypt from 'bcryptjs';

const ALL_PERMISSIONS = [
  'user.view','user.create','user.edit','user.delete','user.permission_grant',
  'machine.view','machine.create','machine.edit','machine.delete',
  'machine.transfer','machine.fuel_log','machine.hour_log',
  'site.view','site.view_own','site.create','site.edit','site.delete',
  'site.assign_machine','site.assign_leader','site.log_own',
  'order.view','order.create','order.approve','order.edit',
  'schedule.view','schedule.edit',
  'workorder.view','workorder.create','workorder.edit','workorder.edit_any','workorder.close',
  'issue.view','issue.create','issue.resolve',
  'shelf.view','shelf.scan_out','shelf.scan_in','shelf.manage','shelf.export',
  'finance.view','finance.export',
  'notification.receive_service','notification.receive_order','notification.receive_issue',
  'audit.view',
];

const TEMPLATES = [
  {
    name: 'Építésvezető',
    permissions: [
      'order.create','order.view','site.view_own','schedule.view',
      'machine.view','machine.hour_log','machine.fuel_log','site.log_own',
      'issue.create','issue.view','workorder.view','notification.receive_order',
    ],
  },
  {
    name: 'Logisztikus',
    permissions: [
      'order.view','order.approve','order.edit','site.view','site.create',
      'site.edit','site.assign_machine','site.assign_leader','machine.view',
      'machine.create','machine.edit','machine.transfer','machine.hour_log',
      'machine.fuel_log','schedule.view','schedule.edit','shelf.view','shelf.export',
      'notification.receive_order','notification.receive_issue',
    ],
  },
  {
    name: 'Szervizes',
    permissions: [
      'machine.view','machine.hour_log','site.view','workorder.view',
      'workorder.create','workorder.edit','workorder.close','issue.view',
      'issue.create','issue.resolve','shelf.view','shelf.scan_out',
      'shelf.scan_in','schedule.view','notification.receive_service','notification.receive_issue',
    ],
  },
  {
    name: 'Gazdasági',
    permissions: [
      'site.view','machine.view','order.view','schedule.view',
      'workorder.view','finance.view','finance.export','shelf.view',
    ],
  },
  {
    name: 'Teljes hozzáférés',
    permissions: ALL_PERMISSIONS,
  },
];

async function seed() {
  console.log('[seed] Indítás...');

  // Sablonok
  for (const tpl of TEMPLATES) {
    await db.query(
      `INSERT INTO permission_templates (name, permissions)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET permissions = $2`,
      [tpl.name, tpl.permissions]
    );
  }
  console.log('[seed] Sablonok betöltve.');

  // Superuser
  const superEmail = 'gekox1111@gmail.com';
  const hash = await bcrypt.hash(process.env.SUPERUSER_PASSWORD || 'changeme123!', 12);

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [superEmail]);
  let superUserId: string;

  if (existing.rows.length === 0) {
    const res = await db.query(
      `INSERT INTO users (email, name, password_hash, active)
       VALUES ($1, $2, $3, TRUE) RETURNING id`,
      [superEmail, 'Daniell (Admin)', hash]
    );
    superUserId = res.rows[0].id;
    console.log('[seed] Superuser létrehozva.');
  } else {
    superUserId = existing.rows[0].id;
    console.log('[seed] Superuser már létezik.');
  }

  // Minden jog TRUE
  for (const perm of ALL_PERMISSIONS) {
    await db.query(
      `INSERT INTO user_permissions (user_id, permission_key, granted)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (user_id, permission_key) DO UPDATE SET granted = TRUE`,
      [superUserId, perm]
    );
  }
  console.log('[seed] Superuser jogosultságok beállítva.');
  process.exit(0);
}

seed().catch((e) => {
  console.error('[seed] HIBA:', e);
  process.exit(1);
});
