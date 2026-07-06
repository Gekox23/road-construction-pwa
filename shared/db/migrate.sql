-- ================================================================
-- ROAD CONSTRUCTION PWA - Teljes adatbázis séma
-- Futtatás: Supabase > SQL Editor > New query > ide illeszd be > Run
-- ================================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- FIX: pg_trgm extension typeahead/autocomplete kereséshez (specifikáció előírja)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ================================================================
-- USERS
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- USER PERMISSIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, permission_key)
);

-- ================================================================
-- PERMISSION TEMPLATES
-- ================================================================
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO permission_templates (name, permissions) VALUES
  ('Építésvezető', ARRAY[
    'order.create', 'order.view',
    'site.view_own',
    'schedule.view',
    'machine.view', 'machine.hour_log', 'machine.fuel_log',
    'site.log_own',
    'issue.create', 'issue.view',
    'workorder.view',
    'notification.receive_order'
  ]),
  ('Logisztikus', ARRAY[
    'order.view', 'order.approve', 'order.edit',
    'site.view', 'site.create', 'site.edit', 'site.assign_machine', 'site.assign_leader',
    'machine.view', 'machine.create', 'machine.edit', 'machine.transfer',
    'machine.hour_log', 'machine.fuel_log',
    'schedule.view', 'schedule.edit',
    'shelf.view', 'shelf.export',
    'notification.receive_order', 'notification.receive_issue'
  ]),
  ('Szervizes', ARRAY[
    'machine.view', 'machine.hour_log',
    'site.view',
    'workorder.view', 'workorder.create', 'workorder.edit', 'workorder.close',
    'issue.view', 'issue.create', 'issue.resolve',
    'shelf.view', 'shelf.scan_out', 'shelf.scan_in',
    'schedule.view',
    'notification.receive_service', 'notification.receive_issue'
  ]),
  ('Gazdasági', ARRAY[
    'site.view', 'machine.view', 'order.view',
    'schedule.view',
    'workorder.view',
    'finance.view', 'finance.export',
    'shelf.view'
  ]),
  ('Teljes hozzáférés', ARRAY[
    'user.view', 'user.create', 'user.edit', 'user.delete', 'user.permission_grant',
    'machine.view', 'machine.create', 'machine.edit', 'machine.delete',
    'machine.transfer', 'machine.fuel_log', 'machine.hour_log',
    'site.view', 'site.view_own', 'site.create', 'site.edit', 'site.delete',
    'site.assign_machine', 'site.assign_leader', 'site.log_own',
    'order.view', 'order.create', 'order.approve', 'order.edit',
    'schedule.view', 'schedule.edit',
    'workorder.view', 'workorder.create', 'workorder.edit', 'workorder.edit_any', 'workorder.close',
    'issue.view', 'issue.create', 'issue.resolve',
    'shelf.view', 'shelf.scan_out', 'shelf.scan_in', 'shelf.manage', 'shelf.export',
    'finance.view', 'finance.export',
    'notification.receive_service', 'notification.receive_order', 'notification.receive_issue',
    'audit.view'
  ])
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- SITES (Építkezések)
-- ================================================================
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  leader_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','lezart','archivalt')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_users (
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (site_id, user_id)
);

-- ================================================================
-- MACHINES (Gépek)
-- ================================================================
CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  year INT,
  status TEXT NOT NULL DEFAULT 'raktaron' CHECK (status IN ('raktaron','epitkezesen','szervizben','atadasalatt','archivalt')),
  current_site_id UUID REFERENCES sites(id),
  current_operator_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS machine_hour_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),          -- FIX: melyik építkezésen rögzítve
  event_date DATE NOT NULL,
  hour_value NUMERIC(10,1) NOT NULL,
  photo_url TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),          -- FIX: melyik építkezésen rögzítve
  event_date DATE NOT NULL,
  liters NUMERIC(8,2) NOT NULL,
  location TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FIX: Gép dokumentumok táblája (állapotfotók, kötelező átadás dokumentáció)
CREATE TABLE IF NOT EXISTS machine_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('allapotfoto','uzemora_foto','atadas_foto','egyeb')),
  photo_url TEXT NOT NULL,
  notes TEXT,
  is_transfer_required BOOLEAN NOT NULL DEFAULT FALSE,  -- kötelező átadáskori dokumentáció
  event_date DATE NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- SCHEDULE (Heti vezénylés)
-- ================================================================
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  site_id UUID REFERENCES sites(id),
  machine_id UUID REFERENCES machines(id),
  operator_id UUID REFERENCES users(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- WORKORDERS (Munkalapok)
-- ================================================================
CREATE TABLE IF NOT EXISTS workorders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  issue_id UUID,
  work_type TEXT,
  description TEXT,
  event_date DATE NOT NULL,
  work_start TIMESTAMPTZ,
  work_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'uj' CHECK (status IN ('uj','folyamatban','befejezve','lezarva')),
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- ISSUES (Hibabejelentések)
-- ================================================================
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  site_id UUID REFERENCES sites(id),
  description TEXT NOT NULL,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'nyitott' CHECK (status IN ('nyitott','folyamatban','megoldott')),
  reported_by UUID REFERENCES users(id),
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- ORDERS (Megrendelések)
-- ================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'fuggoben' CHECK (status IN ('fuggoben','jovahagyva','elutasitva','teljesitve')),
  notes TEXT,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT,
  unknown_item BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- SHELF (Polcrendszer)
-- ================================================================
CREATE TABLE IF NOT EXISTS shelf_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  item_type TEXT NOT NULL DEFAULT 'eszkoz' CHECK (item_type IN ('eszkoz','foyoeszkoz')),
  status TEXT NOT NULL DEFAULT 'polcon' CHECK (status IN ('polcon','kiveve','archivalt')),
  current_holder_id UUID REFERENCES users(id),
  quantity_percent INT NOT NULL DEFAULT 100 CHECK (quantity_percent BETWEEN 0 AND 100),
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shelf_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelf_item_id UUID NOT NULL REFERENCES shelf_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('ki','be')),
  user_id UUID REFERENCES users(id),
  quantity_before INT,
  quantity_after INT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- AUDIT LOG
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  module TEXT NOT NULL,
  function_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- INDEXEK (gyorsabb lekérdezések)
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);
CREATE INDEX IF NOT EXISTS idx_machines_type_trgm ON machines USING gin(type gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_machines_code_trgm ON machines USING gin(machine_code gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_machines_event_date ON machine_hour_logs(event_date);
CREATE INDEX IF NOT EXISTS idx_fuel_event_date ON machine_fuel_logs(event_date);
CREATE INDEX IF NOT EXISTS idx_schedule_week ON schedule_entries(week_start);
CREATE INDEX IF NOT EXISTS idx_workorders_status ON workorders(status);
CREATE INDEX IF NOT EXISTS idx_workorders_event_date ON workorders(event_date);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_event_date ON issues(event_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_shelf_qr ON shelf_items(qr_code);
CREATE INDEX IF NOT EXISTS idx_shelf_name_trgm ON shelf_items USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_machine_docs_machine ON machine_documents(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_docs_event_date ON machine_documents(event_date);
