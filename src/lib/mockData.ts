import type { Citizen } from '@/types/citizen';

export const DISTRICTS = ['Ahmedabad', 'Mumbai', 'Jaipur', 'Kochi', 'Lucknow', 'Visakhapatnam', 'Vadodara', 'Surat'];

export const ALL_VILLAGES = [
  'Navrangpura', 'Piplod', 'Sanganer', 'San Thome', 'Kerwa', 'Adajan',
  'Khandera', 'Katargam', 'Kalamassery', 'Goner', 'Gandhinagar', 'Bopal',
  'Vasna', 'Manjalpur', 'Akota', 'Athwa', 'Udhna', 'Vesu',
];

export const TALUKAS: Record<string, string[]> = {
  Ahmedabad: ['Daskroi', 'Sanand', 'Viramgam'],
  Mumbai: ['Choryasi', 'Andheri', 'Bandra'],
  Jaipur: ['Amer', 'Sanganer', 'Chomu'],
  Kochi: ['Mylapore', 'Kanjani', 'Aluva'],
  Lucknow: ['Huzur', 'Malihabad', 'Mohan'],
  Visakhapatnam: ['Choryasi', 'Anakapalli', 'Pendurthi'],
  Vadodara: ['Padra', 'Karjan', 'Savli'],
  Surat: ['Choryasi', 'Kamrej', 'Palsana'],
};

export const WETLANDS = [
  'Nal Sarovar', 'Thane Creek Flamingo Sanctuary', 'Keoladeo National Park',
  'Chilika Lake', 'Loktak Lake', 'Kolleru Lake', 'Wadhvana', 'Pariej',
  'Narmada Estuary', 'Gulf of Kutch', 'Thol Lake', 'Khijadiya',
];

const todayStr = new Date().toISOString();

const SEED_CITIZENS: Citizen[] = [
  {
    id: 'CIT-001', fullName: 'Rajesh Patel', mobile: '9876543210', whatsapp: '9876543210',
    email: 'rajesh@example.com', dateOfBirth: '1985-06-15', gender: 'Male',
    state: 'Gujarat', district: 'Ahmedabad', taluka: 'Daskroi', village: 'Navrangpura',
    pincode: '380015', nearbyWetland: 'Nal Sarovar', gpsLocation: '22.5726, 72.9289',
    distanceFromWetland: '10-25 km', occupation: 'Farmer', occupationOther: '',
    alertMethods: ['SMS', 'WhatsApp'], alertTypes: ['Flood', 'Water Pollution', 'Weather'],
    language: 'Gujarati', emergencyName: 'Meena Patel', emergencyMobile: '9876543221',
    emergencyRelationship: 'Spouse', agree: true, status: 'active', rejectionReason: '',
    adminNotes: '', createdAt: '2026-06-15T10:30:00Z', approvedAt: '2026-06-16T08:00:00Z',
    rejectedAt: null, verificationRequestedAt: null, lastAlertAt: '2026-06-28T06:00:00Z', disabledAt: null,
  },
  {
    id: 'CIT-002', fullName: 'Sunita Desai', mobile: '9988776655', whatsapp: '9988776655',
    email: 'sunita.d@example.com', dateOfBirth: '1990-11-22', gender: 'Female',
    state: 'Maharashtra', district: 'Mumbai', taluka: 'Choryasi', village: 'Piplod',
    pincode: '400001', nearbyWetland: 'Thane Creek Flamingo Sanctuary',
    gpsLocation: '19.0760, 72.8777', distanceFromWetland: '5-10 km',
    occupation: 'NGO Volunteer', occupationOther: '', alertMethods: ['WhatsApp', 'Email'],
    alertTypes: ['Flood', 'Wildlife', 'Bird Disease', 'Illegal Dumping'], language: 'English',
    emergencyName: 'Amit Desai', emergencyMobile: '9988776644', emergencyRelationship: 'Brother',
    agree: true, status: 'pending', rejectionReason: '', adminNotes: '',
    createdAt: '2026-06-28T14:00:00Z', approvedAt: null, rejectedAt: null,
    verificationRequestedAt: null, lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-003', fullName: 'Vikram Singh', mobile: '9123456780', whatsapp: '9123456780',
    email: 'vikram@example.com', dateOfBirth: '1978-03-08', gender: 'Male',
    state: 'Rajasthan', district: 'Jaipur', taluka: 'Amer', village: 'Sanganer',
    pincode: '302002', nearbyWetland: 'Keoladeo National Park', gpsLocation: '27.0238, 74.2179',
    distanceFromWetland: '25-50 km', occupation: 'Forest Staff', occupationOther: '',
    alertMethods: ['SMS'], alertTypes: ['Fire', 'Wildlife', 'Illegal Dumping'], language: 'Hindi',
    emergencyName: 'Anita Singh', emergencyMobile: '9123456781', emergencyRelationship: 'Spouse',
    agree: true, status: 'pending', rejectionReason: '', adminNotes: '',
    createdAt: '2026-06-29T09:15:00Z', approvedAt: null, rejectedAt: null,
    verificationRequestedAt: null, lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-004', fullName: 'Priya Kumar', mobile: '9012345678', whatsapp: '9012345678',
    email: 'priya.k@example.com', dateOfBirth: '1995-09-12', gender: 'Female',
    state: 'Kerala', district: 'Kochi', taluka: 'Mylapore', village: 'San Thome',
    pincode: '682001', nearbyWetland: 'Chilika Lake', gpsLocation: '19.7385, 85.3097',
    distanceFromWetland: '>50 km', occupation: 'Student', occupationOther: '',
    alertMethods: ['Email'], alertTypes: ['Flood', 'Weather', 'Bird Disease'], language: 'English',
    emergencyName: 'Suresh Kumar', emergencyMobile: '9012345679', emergencyRelationship: 'Father',
    agree: true, status: 'rejected', rejectionReason: 'Incomplete address details. Please provide full village name.',
    adminNotes: '', createdAt: '2026-06-25T16:45:00Z', approvedAt: null,
    rejectedAt: '2026-06-27T10:00:00Z', verificationRequestedAt: null, lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-005', fullName: 'Arun Joshi', mobile: '8877665544', whatsapp: '8877665544',
    email: '', dateOfBirth: '', gender: '', state: 'Uttar Pradesh', district: 'Lucknow',
    taluka: 'Huzur', village: 'Kerwa', pincode: '226001', nearbyWetland: 'Loktak Lake',
    gpsLocation: '', distanceFromWetland: '5-10 km', occupation: 'Fisherman', occupationOther: '',
    alertMethods: ['SMS', 'WhatsApp'], alertTypes: ['Water Pollution', 'Fire', 'Wildlife', 'Weather'],
    language: 'Hindi', emergencyName: 'Geeta Joshi', emergencyMobile: '8877665533',
    emergencyRelationship: 'Spouse', agree: true, status: 'pending', rejectionReason: '',
    adminNotes: '', createdAt: '2026-06-30T08:30:00Z', approvedAt: null, rejectedAt: null,
    verificationRequestedAt: null, lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-006', fullName: 'Lakshmi Reddy', mobile: '7766554433', whatsapp: '7766554433',
    email: 'lakshmi.r@example.com', dateOfBirth: '1988-01-20', gender: 'Female',
    state: 'Andhra Pradesh', district: 'Visakhapatnam', taluka: 'Choryasi', village: 'Adajan',
    pincode: '530001', nearbyWetland: 'Kolleru Lake', gpsLocation: '17.6868, 83.2185',
    distanceFromWetland: '1-5 km', occupation: 'Villager', occupationOther: '',
    alertMethods: ['SMS'], alertTypes: ['Flood', 'Water Pollution', 'Weather'], language: 'English',
    emergencyName: 'Venkat Reddy', emergencyMobile: '7766554422', emergencyRelationship: 'Husband',
    agree: true, status: 'active', rejectionReason: '', adminNotes: '',
    createdAt: '2026-06-10T11:00:00Z', approvedAt: '2026-06-11T09:00:00Z',
    rejectedAt: null, verificationRequestedAt: null, lastAlertAt: '2026-06-25T07:00:00Z', disabledAt: null,
  },
  {
    id: 'CIT-007', fullName: 'Ananya Sharma', mobile: '8899001122', whatsapp: '8899001122',
    email: 'ananya.s@example.com', dateOfBirth: '1992-04-18', gender: 'Female',
    state: 'Gujarat', district: 'Vadodara', taluka: 'Padra', village: 'Khandera',
    pincode: '390015', nearbyWetland: 'Wadhvana', gpsLocation: '22.2154, 73.2083',
    distanceFromWetland: '1-5 km', occupation: 'Teacher', occupationOther: '',
    alertMethods: ['SMS', 'Email'], alertTypes: ['Flood', 'Weather'], language: 'Gujarati',
    emergencyName: 'Rohit Sharma', emergencyMobile: '8899001133', emergencyRelationship: 'Brother',
    agree: true, status: 'pending-verification', rejectionReason: '', adminNotes: '',
    createdAt: '2026-06-20T09:00:00Z', approvedAt: null, rejectedAt: null,
    verificationRequestedAt: '2026-06-22T11:30:00Z', lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-008', fullName: 'Manoj Verma', mobile: '7788996655', whatsapp: '7788996655',
    email: 'manoj.v@example.com', dateOfBirth: '1982-09-05', gender: 'Male',
    state: 'Gujarat', district: 'Surat', taluka: 'Choryasi', village: 'Katargam',
    pincode: '395004', nearbyWetland: 'Pariej', gpsLocation: '21.1702, 72.8311',
    distanceFromWetland: '10-25 km', occupation: 'Shopkeeper', occupationOther: '',
    alertMethods: ['WhatsApp'], alertTypes: ['Flood', 'Water Pollution'], language: 'Hindi',
    emergencyName: 'Sita Verma', emergencyMobile: '7788996644', emergencyRelationship: 'Spouse',
    agree: true, status: 'pending', rejectionReason: '', adminNotes: '',
    createdAt: todayStr, approvedAt: null, rejectedAt: null, verificationRequestedAt: null, lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-009', fullName: 'Deepa Nair', mobile: '6677889944', whatsapp: '6677889944',
    email: 'deepa.n@example.com', dateOfBirth: '1987-12-01', gender: 'Female',
    state: 'Kerala', district: 'Kochi', taluka: 'Aluva', village: 'Kalamassery',
    pincode: '683104', nearbyWetland: 'Chilika Lake', gpsLocation: '',
    distanceFromWetland: '>50 km', occupation: 'IT Professional', occupationOther: '',
    alertMethods: ['Email', 'WhatsApp'], alertTypes: ['Weather', 'Bird Disease'],
    language: 'English', emergencyName: 'Rajan Nair', emergencyMobile: '6677889933',
    emergencyRelationship: 'Father', agree: true, status: 'active', rejectionReason: '',
    adminNotes: '', createdAt: '2026-06-18T13:00:00Z', approvedAt: todayStr,
    rejectedAt: null, verificationRequestedAt: null, lastAlertAt: '2026-06-29T14:00:00Z', disabledAt: null,
  },
  {
    id: 'CIT-010', fullName: 'Ravi Kumar', mobile: '9988001122', whatsapp: '9988001122',
    email: 'ravi.k@example.com', dateOfBirth: '1975-07-22', gender: 'Male',
    state: 'Rajasthan', district: 'Jaipur', taluka: 'Chomu', village: 'Goner',
    pincode: '303804', nearbyWetland: 'Keoladeo National Park', gpsLocation: '26.9124, 75.7873',
    distanceFromWetland: '25-50 km', occupation: 'Villager', occupationOther: '',
    alertMethods: ['SMS'], alertTypes: ['Fire', 'Wildlife'], language: 'Hindi',
    emergencyName: 'Kavita Kumar', emergencyMobile: '9988001133', emergencyRelationship: 'Spouse',
    agree: true, status: 'rejected', rejectionReason: 'Mobile number not reachable. Please update.',
    adminNotes: '', createdAt: '2026-06-22T07:30:00Z', approvedAt: null,
    rejectedAt: todayStr, verificationRequestedAt: null, lastAlertAt: null, disabledAt: null,
  },
  {
    id: 'CIT-011', fullName: 'Sneha Kapoor', mobile: '9988770011', whatsapp: '9988770011',
    email: 'sneha.k@example.com', dateOfBirth: '1991-03-14', gender: 'Female',
    state: 'Gujarat', district: 'Ahmedabad', taluka: 'Sanand', village: 'Bopal',
    pincode: '380058', nearbyWetland: 'Thol Lake', gpsLocation: '23.1000, 72.5500',
    distanceFromWetland: '1-5 km', occupation: 'Teacher', occupationOther: '',
    alertMethods: ['SMS', 'WhatsApp', 'Email'], alertTypes: ['Flood', 'Weather', 'Water Pollution'],
    language: 'Gujarati', emergencyName: 'Rahul Kapoor', emergencyMobile: '9988770022',
    emergencyRelationship: 'Brother', agree: true, status: 'disabled', rejectionReason: '',
    adminNotes: 'Account temporarily disabled per user request.', createdAt: '2026-06-05T09:00:00Z',
    approvedAt: '2026-06-06T10:00:00Z', rejectedAt: null, verificationRequestedAt: null,
    lastAlertAt: '2026-06-20T08:00:00Z', disabledAt: '2026-06-25T12:00:00Z',
  },
];

export function loadCitizens(): Citizen[] {
  try {
    const stored = localStorage.getItem('avian_citizens');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem('avian_citizens', JSON.stringify(SEED_CITIZENS));
    return SEED_CITIZENS;
  } catch {
    localStorage.setItem('avian_citizens', JSON.stringify(SEED_CITIZENS));
    return SEED_CITIZENS;
  }
}

export function saveCitizens(citizens: Citizen[]): void {
  localStorage.setItem('avian_citizens', JSON.stringify(citizens));
}

export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
