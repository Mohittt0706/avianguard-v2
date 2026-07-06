const mongoose = require('mongoose');
const Wetland = require('../src/models/Wetland');
const SensorStation = require('../src/models/SensorStation');
const Sensor = require('../src/models/Sensor');
const Alert = require('../src/models/Alert');
const Citizen = require('../src/models/Citizen');
const Report = require('../src/models/Report');

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/avianguard';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Promise.all([
    Wetland.deleteMany({}),
    SensorStation.deleteMany({}),
    Sensor.deleteMany({}),
    Alert.deleteMany({}),
    Citizen.deleteMany({}),
    Report.deleteMany({}),
  ]);

  const wetland = await Wetland.create({
    name: 'Nal Sarovar',
    localName: 'નળ સરોવર',
    description: 'A prominent wetland and bird sanctuary in Gujarat.',
    district: 'Ahmedabad',
    state: 'Gujarat',
    coordinates: { latitude: 22.8231, longitude: 72.0456 },
    area: '120.82 km²',
    type: 'lake',
    status: 'active',
    riskLevel: 'moderate',
    sensorStationCount: 5,
    citizenCount: 12,
    isActive: true,
  });

  const stations = await SensorStation.create([
    { name: 'Station Alpha', stationId: 'NS-ALPHA-01', wetland: wetland._id, location: { latitude: 22.82, longitude: 72.04 }, status: 'online', batteryLevel: 85, isActive: true },
    { name: 'Station Beta', stationId: 'NS-BETA-02', wetland: wetland._id, location: { latitude: 22.83, longitude: 72.05 }, status: 'online', batteryLevel: 72, isActive: true },
    { name: 'Station Gamma', stationId: 'NS-GAMMA-03', wetland: wetland._id, location: { latitude: 22.81, longitude: 72.03 }, status: 'warning', batteryLevel: 34, isActive: true },
    { name: 'Station Delta', stationId: 'NS-DELTA-04', wetland: wetland._id, location: { latitude: 22.84, longitude: 72.06 }, status: 'offline', batteryLevel: 5, isActive: true },
    { name: 'Station Epsilon', stationId: 'NS-EPSILON-05', wetland: wetland._id, location: { latitude: 22.82, longitude: 72.07 }, status: 'online', batteryLevel: 91, isActive: true },
  ]);

  const sensorTypes = [
    { type: 'temperature', unit: '°C' },
    { type: 'ph', unit: 'pH' },
    { type: 'tds', unit: 'ppm' },
    { type: 'dissolved_oxygen', unit: 'mg/L' },
    { type: 'water_level', unit: 'm' },
    { type: 'turbidity', unit: 'NTU' },
  ];

  const sensors = [];
  for (const station of stations) {
    for (const st of sensorTypes) {
      sensors.push({
        sensorId: `${station.stationId}-${st.type.toUpperCase()}`,
        station: station._id,
        type: st.type,
        unit: st.unit,
        status: station.status === 'offline' ? 'inactive' : 'active',
        isActive: station.status !== 'offline',
        lastReading: {
          value: parseFloat((Math.random() * 30 + 10).toFixed(1)),
          recordedAt: new Date(),
        },
      });
    }
  }
  await Sensor.create(sensors);

  const alertTemplates = [
    { type: 'water_level', severity: 'warning', title: 'Water level rising at Station Beta', message: 'Water level has increased 15% above normal range.' },
    { type: 'temperature', severity: 'info', title: 'Temperature within normal range', message: 'All temperature sensors reporting normal values.' },
    { type: 'tds', severity: 'warning', title: 'TDS elevated at Station Gamma', message: 'Total dissolved solids reading is above threshold.' },
    { type: 'dissolved_oxygen', severity: 'critical', title: 'Critical DO drop at Station Gamma', message: 'Dissolved oxygen levels critically low — immediate action required.' },
    { type: 'ph', severity: 'warning', title: 'pH drift detected', message: 'pH levels showing deviation from neutral range.' },
    { type: 'system', severity: 'info', title: 'Station Delta offline', message: 'Station Delta has not reported for over 24 hours. Battery critically low.' },
  ];

  await Alert.create(
    alertTemplates.map((t, i) => ({
      wetland: wetland._id,
      station: i < stations.length ? stations[i]._id : undefined,
      type: t.type,
      severity: t.severity,
      title: t.title,
      message: t.message,
      value: parseFloat((Math.random() * 100).toFixed(1)),
      threshold: 75,
      status: t.severity === 'info' ? 'resolved' : 'active',
      source: 'sensor',
    })),
  );

  const districts = ['Ahmedabad', 'Mehsana', 'Gandhinagar', 'Kutch', 'Vadodara'];
  const citizens = [];
  for (let i = 1; i <= 12; i++) {
    citizens.push({
      fullName: `Citizen ${i}`,
      mobile: `98765${String(i).padStart(5, '0')}`,
      email: `citizen${i}@example.com`,
      district: districts[i % districts.length],
      taluka: 'Taluka',
      village: `Village ${i}`,
      nearbyWetland: 'Nal Sarovar',
      status: i <= 8 ? 'active' : 'pending',
      alertMethods: ['SMS'],
      language: 'English',
      agree: true,
    });
  }
  await Citizen.create(citizens);

  const reportTypes = ['daily', 'weekly', 'monthly', 'analytics'];
  for (let i = 0; i < 6; i++) {
    await Report.create({
      title: `${reportTypes[i % reportTypes.length]} Report - Week ${i + 1}`,
      type: reportTypes[i % reportTypes.length],
      format: 'PDF',
      wetland: wetland._id,
      summary: `Automated ${reportTypes[i % reportTypes.length]} report for Nal Sarovar.`,
      status: 'completed',
      completedAt: new Date(Date.now() - i * 86400000),
    });
  }

  console.log('Mongoose seed completed successfully');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
