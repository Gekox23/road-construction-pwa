// =============================================================
// SHARED TYPES – üzleti logika NÉLKÜL
// Minden modul importálhatja, modulok egymást NEM importálhatják
// =============================================================

export type PermissionKey =
  | 'user.view' | 'user.create' | 'user.edit' | 'user.delete' | 'user.permission_grant'
  | 'machine.view' | 'machine.create' | 'machine.edit' | 'machine.delete'
  | 'machine.transfer' | 'machine.fuel_log' | 'machine.hour_log'
  | 'site.view' | 'site.view_own' | 'site.create' | 'site.edit' | 'site.delete'
  | 'site.assign_machine' | 'site.assign_leader' | 'site.log_own'
  | 'order.view' | 'order.create' | 'order.approve' | 'order.edit'
  | 'schedule.view' | 'schedule.edit'
  | 'workorder.view' | 'workorder.create' | 'workorder.edit'
  | 'workorder.edit_any' | 'workorder.close'
  | 'issue.view' | 'issue.create' | 'issue.resolve'
  | 'shelf.view' | 'shelf.scan_out' | 'shelf.scan_in' | 'shelf.manage' | 'shelf.export'
  | 'finance.view' | 'finance.export'
  | 'notification.receive_service' | 'notification.receive_order' | 'notification.receive_issue';

export const ALL_PERMISSIONS: PermissionKey[] = [
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
];

export const PERMISSION_TEMPLATES: Record<string, PermissionKey[]> = {
  'Epitésvezető': ['order.create','order.view','site.view_own','schedule.view','machine.view','machine.hour_log','machine.fuel_log','site.log_own','issue.create','issue.view','workorder.view','notification.receive_order'],
  'Logisztikus': ['order.view','order.approve','order.edit','site.view','site.create','site.edit','site.assign_machine','site.assign_leader','machine.view','machine.create','machine.edit','machine.transfer','machine.hour_log','machine.fuel_log','schedule.view','schedule.edit','shelf.view','shelf.export','notification.receive_order','notification.receive_issue'],
  'Szervizes': ['machine.view','machine.hour_log','site.view','workorder.view','workorder.create','workorder.edit','workorder.close','issue.view','issue.create','issue.resolve','shelf.view','shelf.scan_out','shelf.scan_in','schedule.view','notification.receive_service','notification.receive_issue'],
  'Gazdasagi': ['site.view','machine.view','order.view','schedule.view','workorder.view','finance.view','finance.export','shelf.view'],
  'Teljes hozzaferes': ALL_PERMISSIONS,
};

export type MachineStatus = 'Raktáron' | 'Épitkezésen' | 'Szervizben' | 'Átadás alatt' | 'Archivált';
export type SiteStatus = 'Aktív' | 'Szünetel' | 'Lezárt' | 'Archivált';
export type OrderStatus = 'Függőben' | 'Pontosítás szükséges' | 'Jóváhagyva' | 'Elutasítva' | 'Teljesítve';
export type WorkOrderStatus = 'Új' | 'Folyamatban' | 'Befejezve' | 'Lezárva';
export type IssueStatus = 'Nyitott' | 'Folyamatban' | 'Megoldva';
export type ShelfItemType = 'Egyedi' | 'Fogyóeszköz';

export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

export interface Machine {
  id: string;
  machine_code: string;
  type: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  status: MachineStatus;
  current_site_id?: string;
  current_operator_id?: string;
  notes?: string;
  is_archived: boolean;
  created_at: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}
