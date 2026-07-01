-- ================================================================
-- SUPERUSER SEED - Supabase SQL Editorban futtasd ezt!
-- FONTOS: Cseréld ki a jelszó hash-t!
-- Hash generálás: https://bcrypt-generator.com (cost: 12)
-- ================================================================

-- 1. Superuser létrehozása (jelszó: Admin2026! - VÁLTOZTASD MEG!)
INSERT INTO users (email, name, password_hash, active, must_change_password)
VALUES (
  'gekox1111@gmail.com',
  'Admin (Gekox)',
  '$2a$12$placeholder_csereldd_le_bcrypt_hashre',
  TRUE,
  FALSE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Minden jogosultság megadása a superusernek
DO $$
DECLARE
  uid UUID;
  perms TEXT[] := ARRAY[
    'schedule.view','schedule.edit',
    'machine.view','machine.create','machine.edit','machine.hour_log','machine.fuel_log',
    'site.view','site.view_own','site.create','site.edit',
    'workorder.view','workorder.create','workorder.edit',
    'issue.view','issue.create','issue.resolve',
    'order.view','order.create','order.approve',
    'shelf.view','shelf.scan_out','shelf.scan_in','shelf.manage',
    'finance.view',
    'user.view','user.create','user.edit','user.permission_grant'
  ];
  perm TEXT;
BEGIN
  SELECT id INTO uid FROM users WHERE email = 'gekox1111@gmail.com';
  FOREACH perm IN ARRAY perms LOOP
    INSERT INTO user_permissions (user_id, permission_key, granted)
    VALUES (uid, perm, TRUE)
    ON CONFLICT (user_id, permission_key) DO NOTHING;
  END LOOP;
END $$;
