const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const officers = [
    {
      name: 'Dr. Rajesh Patel',
      email: 'rajesh.patel@avianguard.org',
      role: 'SUPER_ADMIN',
      district: 'Ahmedabad',
      taluka: 'Sanand',
      assignedWetland: 'Nal Sarovar',
      phone: '+919876543210',
      employeeId: 'EMP-001',
      department: 'Environmental Science',
      designation: 'Chief Environmental Officer',
      address: 'Block A, Gujarat State Environmental Board, Gandhinagar',
      accountStatus: 'ACTIVE',
    },
    {
      name: 'Anita Sharma',
      email: 'anita.sharma@avianguard.org',
      role: 'ADMIN',
      district: 'Mehsana',
      taluka: 'Kadi',
      assignedWetland: 'Thol Lake',
      phone: '+919876543211',
      employeeId: 'EMP-002',
      department: 'Water Resources',
      designation: 'Senior Environmental Officer',
      address: 'Water Resources Department, Mehsana Division',
      accountStatus: 'ACTIVE',
    },
    {
      name: 'Vikram Joshi',
      email: 'vikram.joshi@avianguard.org',
      role: 'OPERATOR',
      district: 'Jamnagar',
      taluka: 'Jamnagar',
      assignedWetland: 'Khijadiya',
      phone: '+919876543212',
      employeeId: 'EMP-003',
      department: 'Field Operations',
      designation: 'Field Monitoring Officer',
      address: 'Khijadiya Bird Sanctuary Office, Jamnagar',
      accountStatus: 'ACTIVE',
    },
    {
      name: 'Priya Desai',
      email: 'priya.desai@avianguard.org',
      role: 'OPERATOR',
      district: 'Anand',
      taluka: 'Anand',
      assignedWetland: 'Pariej',
      phone: '+919876543213',
      employeeId: 'EMP-004',
      department: 'Pollution Control',
      designation: 'Pollution Control Officer',
      address: 'GSPC Building, Anand District',
      accountStatus: 'ACTIVE',
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@avianguard.org',
      role: 'VIEWER',
      district: 'Vadodara',
      taluka: 'Padra',
      assignedWetland: 'Narmada Estuary',
      phone: '+919876543214',
      employeeId: 'EMP-005',
      department: 'Research',
      designation: 'Research Associate',
      address: 'MS University Campus, Vadodara',
      accountStatus: 'ACTIVE',
    },
  ];

  for (const data of officers) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          ...data,
          password: await bcrypt.hash('Admin@123', 12),
          isActive: true,
        },
      });
      console.log(`  ✓ Officer created: ${data.name} (${data.role})`);
    } else {
      console.log(`  - ${data.name} already exists, updating profile...`);
      await prisma.user.update({
        where: { email: data.email },
        data: {
          name: data.name,
          role: data.role,
          district: data.district,
          taluka: data.taluka,
          assignedWetland: data.assignedWetland,
          phone: data.phone,
          employeeId: data.employeeId,
          department: data.department,
          designation: data.designation,
          address: data.address,
          accountStatus: data.accountStatus,
        },
      });
    }
  }

  // Seed sensors with real coordinates for Nal Sarovar wetland
  const testSensors = [
    {
      sensorId: 'NS-TEMP-01',
      name: 'Nal Sarovar Temperature Sensor',
      location: 'Nal Sarovar North',
      latitude: 22.7780,
      longitude: 72.1420,
      wetland: 'Nal Sarovar',
      status: 'online',
      temperature: 28.5,
      ph: 7.2,
      tds: 210,
      dissolvedOxygen: 6.8,
      waterLevel: 3.2,
      battery: 85,
      signalStrength: 72,
    },
    {
      sensorId: 'NS-PH-02',
      name: 'Nal Sarovar pH Sensor',
      location: 'Nal Sarovar East',
      latitude: 22.7650,
      longitude: 72.1580,
      wetland: 'Nal Sarovar',
      status: 'online',
      temperature: 27.8,
      ph: 7.5,
      tds: 195,
      dissolvedOxygen: 7.1,
      waterLevel: 2.9,
      battery: 92,
      signalStrength: 81,
    },
    {
      sensorId: 'NS-TDS-03',
      name: 'Nal Sarovar TDS Sensor',
      location: 'Nal Sarovar South',
      latitude: 22.7520,
      longitude: 72.1350,
      wetland: 'Nal Sarovar',
      status: 'warning',
      temperature: 32.1,
      ph: 6.8,
      tds: 450,
      dissolvedOxygen: 5.2,
      waterLevel: 2.4,
      battery: 45,
      signalStrength: 55,
    },
    {
      sensorId: 'NS-DO-04',
      name: 'Nal Sarovar DO Sensor',
      location: 'Nal Sarovar West',
      latitude: 22.7700,
      longitude: 72.1180,
      wetland: 'Nal Sarovar',
      status: 'offline',
      temperature: null,
      ph: null,
      tds: null,
      dissolvedOxygen: null,
      waterLevel: null,
      battery: 5,
      signalStrength: 12,
    },
    {
      sensorId: 'NS-WL-05',
      name: 'Nal Sarovar Water Level Sensor',
      location: 'Nal Sarovar Center',
      latitude: 22.7640,
      longitude: 72.1400,
      wetland: 'Nal Sarovar',
      status: 'online',
      temperature: 29.3,
      ph: 7.0,
      tds: 180,
      dissolvedOxygen: 6.5,
      waterLevel: 3.8,
      battery: 78,
      signalStrength: 68,
    },
  ];

  for (const sensorData of testSensors) {
    const existing = await prisma.sensor.findUnique({ where: { sensorId: sensorData.sensorId } });
    if (!existing) {
      await prisma.sensor.create({ data: sensorData });
      console.log(`  ✓ Sensor created: ${sensorData.sensorId} (${sensorData.latitude}, ${sensorData.longitude})`);
    } else {
      console.log(`  - Sensor ${sensorData.sensorId} already exists, updating coordinates...`);
      await prisma.sensor.update({
        where: { sensorId: sensorData.sensorId },
        data: { latitude: sensorData.latitude, longitude: sensorData.longitude },
      });
    }
  }

  console.log('✅ Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
