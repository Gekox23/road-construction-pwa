// Permission is typed as string so any permission string is valid at compile time.
// Runtime enforcement is handled by auth.middleware.ts.
export type Permission = string;

export interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  createdAt: string;
  permissions?: Permission[];
}

export interface Machine {
  id: string;
  machineCode: string;
  type: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  status: 'raktaron' | 'epitkezesen' | 'szervizben' | 'atadasalatt' | 'archivalt';
  currentSiteId?: string;
  currentOperatorId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  name: string;
  location?: string;
  leaderId?: string;
  status: 'aktiv' | 'lezart' | 'archivalt';
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  machineId?: string;
  issueId?: string;
  workType?: string;
  description?: string;
  workStart?: string;
  workEnd?: string;
  eventDate: string;
  status: 'uj' | 'folyamatban' | 'befejezve' | 'lezarva';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  machineId?: string;
  siteId?: string;
  description: string;
  photoUrls: string[];
  status: 'nyitott' | 'folyamatban' | 'megoldott';
  reportedBy: string;
  resolvedBy?: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfItem {
  id: string;
  qrCode: string;
  name: string;
  itemType: 'egyedi' | 'foyoeszkoz';
  quantityPercent?: number;
  status: 'polcon' | 'kiveve' | 'archivalt';
  currentHolderId?: string;
  takenAt?: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdBy: string;
  status: 'fuggoben' | 'jovahagyva' | 'elutasitva' | 'teljesitve';
  notes?: string;
  eventDate: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  quantity: number;
  unit?: string;
  unknownItem: boolean;
  notes?: string;
}

export interface ScheduleEntry {
  id: string;
  weekStart: string;
  siteId?: string;
  machineId?: string;
  operatorId?: string;
  dayOfWeek: number;
  notes?: string;
  createdBy: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  permissions: Permission[];
}
