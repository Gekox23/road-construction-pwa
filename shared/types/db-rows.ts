// DB sor típusok – snake_case, ahogy a PostgreSQL visszaadja

export interface MachineRow {
  id: string;
  machine_code: string;
  type: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  status: string;
  current_site_id?: string;
  current_operator_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // JOIN mezők
  site_name?: string;
  operator_name?: string;
}

export interface MachineHourLogRow {
  id: string;
  machine_id: string;
  event_date: string;
  hour_value: number;
  photo_url?: string;
  notes?: string;
  recorded_by: string;
}

export interface MachineFuelLogRow {
  id: string;
  machine_id: string;
  event_date: string;
  liters: number;
  location?: string;
  recorded_by: string;
}

export interface WorkOrderRow {
  id: string;
  machine_id?: string;
  issue_id?: string;
  work_type?: string;
  description?: string;
  work_start?: string;
  work_end?: string;
  event_date: string;
  status: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // JOIN mezők
  machine_type?: string;
  machine_code?: string;
  assigned_name?: string;
}

export interface IssueRow {
  id: string;
  machine_id?: string;
  site_id?: string;
  description: string;
  photo_urls: string[];
  status: string;
  reported_by: string;
  resolved_by?: string;
  event_date: string;
  created_at: string;
  updated_at: string;
  // JOIN mezők
  machine_type?: string;
  machine_code?: string;
  reporter_name?: string;
}

export interface SiteRow {
  id: string;
  name: string;
  location?: string;
  leader_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // JOIN mezők
  leader_name?: string;
  machine_count?: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  active: boolean;
  must_change_password: boolean;
  last_login_at?: string;
  created_at: string;
  password_hash?: string;
}

export interface UserPermissionRow {
  permission_key: string;
  granted: boolean;
}

export interface PermissionTemplateRow {
  id: string;
  name: string;
  permissions: string[];
}

export interface OrderRow {
  id: string;
  created_by: string;
  status: string;
  notes?: string;
  event_date: string;
  created_at: string;
  updated_at?: string;
  // JOIN mezők
  creator_name?: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  unit?: string;
  unknown_item: boolean;
  notes?: string;
}

export interface ScheduleEntryRow {
  id: string;
  week_start: string;
  site_id?: string;
  machine_id?: string;
  operator_id?: string;
  day_of_week: number;
  notes?: string;
  created_by: string;
  // JOIN mezők
  site_name?: string;
  site_location?: string;
  machine_code?: string;
  machine_type?: string;
  operator_name?: string;
}

export interface ShelfItemRow {
  id: string;
  qr_code: string;
  name: string;
  item_type: string;
  quantity_percent?: number;
  status: string;
  current_holder_id?: string;
  taken_at?: string;
  notes?: string;
  // JOIN mezők
  holder_name?: string;
}
