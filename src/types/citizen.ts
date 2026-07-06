export type CitizenStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'PENDING_VERIFICATION' | 'DISABLED';

export interface Citizen {
  id: string;
  fullName: string;
  mobile: string;
  whatsapp: string | null;
  email: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  state: string;
  district: string;
  taluka: string | null;
  village: string | null;
  pincode: string | null;
  nearbyWetland: string;
  gpsLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceFromWetland: string | null;
  occupation: string | null;
  occupationOther: string | null;
  alertMethods: string[];
  alertTypes: string[];
  language: string;
  emergencyName: string | null;
  emergencyMobile: string | null;
  emergencyRelationship: string | null;
  agree: boolean;
  status: CitizenStatus;
  riskLevel: string;
  rejectionReason: string | null;
  adminNotes: string | null;
  isActive: boolean;
  lastAlertAt: string | null;
  fcmToken: string | null;
  fcmTokenUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenWithDetails extends Citizen {
  notifications: CitizenAlertNotification[];
  auditLogs: CitizenAuditLog[];
  stats: {
    notificationsCount: number;
    alertsSent: number;
  };
}

export interface CitizenAlertNotification {
  id: string;
  citizenId: string;
  title: string;
  severity: string;
  message: string;
  wetland: string | null;
  alertType: string | null;
  description: string | null;
  recommendedAction: string | null;
  clickUrl: string | null;
  deliveryMethod: string;
  deliveryStatus: string;
  language: string | null;
  sentBy: string | null;
  sentAt: string;
  readAt: string | null;
  acknowledgedAt: string | null;
}

export interface CitizenAuditLog {
  id: string;
  citizenId: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  performedBy: string | null;
  createdAt: string;
}

export interface CitizenStats {
  total: number;
  pending: number;
  active: number;
  rejected: number;
  disabled: number;
  pendingVerification: number;
  registeredToday: number;
  alertsSentToday: number;
  byDistrict: { district: string; count: number }[];
  byWetland: { wetland: string; count: number }[];
  byLanguage: { language: string; count: number }[];
  byRiskLevel: { riskLevel: string; count: number }[];
}

export interface CitizenAnalytics {
  byDistrict: { district: string; count: number }[];
  byWetland: { wetland: string; count: number }[];
  byLanguage: { language: string; count: number }[];
  riskDistribution: { riskLevel: string; count: number }[];
  alertResponseRate: { total: number; delivered: number; rate: number };
  recentActivity: { date: string; count: number }[];
}

export interface EmergencyBroadcastResult {
  total: number;
  sent: number;
  failed: number;
  deliveryStats: { method: string; count: number; status: string }[];
}

export type NotificationRecord = CitizenAlertNotification;

export const STATUS_CONFIG: Record<CitizenStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ACTIVE: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  REJECTED: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10' },
  PENDING_VERIFICATION: { label: 'Pending Verification', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  DISABLED: { label: 'Disabled', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

export const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  safe: { label: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export interface DeliveryStats {
  totalPushTokens: number;
  totalNotifications: number;
  todayNotifications: number;
  deliveredCount: number;
  failedCount: number;
  readCount: number;
  acknowledgedCount: number;
  deliveryRate: number;
  readRate: number;
  byMethod: { method: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

export interface NotificationInboxEntry {
  id: string;
  title: string;
  severity: string;
  message: string;
  wetland: string | null;
  alertType: string | null;
  description: string | null;
  recommendedAction: string | null;
  clickUrl: string | null;
  deliveryMethod: string;
  deliveryStatus: string;
  language: string | null;
  sentAt: string;
  readAt: string | null;
  acknowledgedAt: string | null;
}

export interface NotificationInboxResponse {
  citizen: { id: string; fullName: string; mobile: string; nearbyWetland: string };
  notifications: NotificationInboxEntry[];
  unreadCount: number;
}
