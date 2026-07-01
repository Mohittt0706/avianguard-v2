export type CitizenStatus = 'pending' | 'active' | 'rejected' | 'pending-verification' | 'disabled';

export interface Citizen {
  id: string;
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  pincode: string;
  nearbyWetland: string;
  gpsLocation: string;
  distanceFromWetland: string;
  occupation: string;
  occupationOther: string;
  alertMethods: string[];
  alertTypes: string[];
  language: string;
  emergencyName: string;
  emergencyMobile: string;
  emergencyRelationship: string;
  agree: boolean;
  status: CitizenStatus;
  rejectionReason: string;
  adminNotes: string;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  verificationRequestedAt: string | null;
  lastAlertAt: string | null;
  disabledAt: string | null;
}

export interface TimelineEntry {
  event: string;
  date: string | null;
  color: string;
}

export interface ManagementStats {
  pending: number;
  approved: number;
  rejected: number;
  disabled: number;
  total: number;
  registeredToday: number;
  alertsSentToday: number;
}

export interface NotificationRecord {
  id: string;
  alertName: string;
  deliveryMethod: string;
  status: string;
  sentAt: string;
}
