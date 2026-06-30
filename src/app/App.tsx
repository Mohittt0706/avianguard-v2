import { useState, useEffect } from 'react';
import { Droplets, Thermometer, Activity, TestTube, Wifi, MapPin, CheckCircle, AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { CircularProgress } from './components/CircularProgress';
import { MetricCard } from './components/MetricCard';
import { SensorChart } from './components/SensorChart';
import { SystemFlow } from './components/SystemFlow';

interface SensorData {
  tds: number;
  temperature: number;
  ph: number;
  timestamp: Date;
}

// Simulate IoT sensor data (mimicking Blynk IoT system)
function generateSensorData(): SensorData {
  return {
    tds: 150 + Math.random() * 100, // Total Dissolved Solids (ppm)
    temperature: 22 + Math.random() * 8, // Temperature (°C)
    ph: 6.5 + Math.random() * 2, // pH level
    timestamp: new Date()
  };
}

let dataIdCounter = 0;

export default function App() {
  const [currentData, setCurrentData] = useState<SensorData>(generateSensorData());
  const [historicalData, setHistoricalData] = useState<Array<{
    id: string;
    time: string;
    tds: number;
    temperature: number;
    ph: number;
  }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Critical alert counters
  const [criticalAlerts, setCriticalAlerts] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  // Check for threats
  const checkThreats = (data: SensorData) => {
    let critical = 0;
    let warn = 0;

    if (data.tds > 400) critical++;
    else if (data.tds > 300) warn++;

    if (data.temperature > 35) critical++;
    else if (data.temperature > 30) warn++;

    if (data.ph > 9.5 || data.ph < 6.0) critical++;
    else if (data.ph > 8.5 || data.ph < 6.5) warn++;

    return { critical, warn };
  };

  // Determine wetland health status
  const getHealthStatus = () => {
    const tdsHealthy = currentData.tds < 300;
    const tempHealthy = currentData.temperature >= 20 && currentData.temperature <= 30;
    const phHealthy = currentData.ph >= 6.5 && currentData.ph <= 8.5;

    if (tdsHealthy && tempHealthy && phHealthy) return 'Excellent';
    if ((tdsHealthy && tempHealthy) || (tdsHealthy && phHealthy) || (tempHealthy && phHealthy)) return 'Good';
    if (tdsHealthy || tempHealthy || phHealthy) return 'Fair';
    return 'Poor';
  };

  // Simulate real-time data updates
  useEffect(() => {
    // Initialize with some historical data
    const initialData = Array.from({ length: 12 }, (_, i) => {
      const data = generateSensorData();
      const time = new Date();
      time.setMinutes(time.getMinutes() - (12 - i) * 5);
      dataIdCounter++;
      return {
        id: `data-${dataIdCounter}`,
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        tds: data.tds,
        temperature: data.temperature,
        ph: data.ph
      };
    });
    setHistoricalData(initialData);

    // Update data every 6 seconds (simulating 5-6 minutes)
    const interval = setInterval(() => {
      const newData = generateSensorData();
      setCurrentData(newData);
      setLastUpdate(new Date());

      // Check for threats and update counters
      const threats = checkThreats(newData);
      setCriticalAlerts(prev => prev + threats.critical);
      setWarnings(prev => prev + threats.warn);
      setTotalEvents(prev => prev + threats.critical + threats.warn);

      dataIdCounter++;
      setHistoricalData(prev => {
        const updated = [
          ...prev.slice(-11),
          {
            id: `data-${dataIdCounter}`,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            tds: newData.tds,
            temperature: newData.temperature,
            ph: newData.ph
          }
        ];
        return updated;
      });

      // Simulate connection status
      setIsConnected(Math.random() > 0.05); // 95% uptime
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const healthStatus = getHealthStatus();
  const isHealthy = healthStatus === 'Excellent' || healthStatus === 'Good';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Droplets className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Smart Wetland Guardian Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Real-Time Wetland Monitoring using AI & IoT
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                <span>Pilot Location: Village Wetland (Prototype Testing Zone)</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <Wifi size={16} />
                <span className="text-sm font-semibold">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* System Status */}
        <div className={`rounded-xl p-6 ${isHealthy ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'}`}>
          <div className="flex items-center gap-4">
            {isHealthy ? (
              <CheckCircle size={48} className="text-green-600" />
            ) : (
              <AlertTriangle size={48} className="text-orange-600" />
            )}
            <div>
              <h2 className={`text-2xl font-bold ${isHealthy ? 'text-green-800' : 'text-orange-800'}`}>
                System Status: {isHealthy ? 'Healthy Ecosystem ✅' : 'Attention Required ⚠️'}
              </h2>
              <p className={`text-sm mt-1 ${isHealthy ? 'text-green-700' : 'text-orange-700'}`}>
                {isHealthy ? 'No environmental threats detected' : 'Some parameters need attention'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Activity}
              label="Wetland Health"
              value={healthStatus}
              subtitle="Stable"
              color="#10b981"
              trend="stable"
            />
            <MetricCard
              icon={Droplets}
              label="Water Quality (TDS)"
              value={`${currentData.tds.toFixed(0)} ppm`}
              subtitle="Total Dissolved Solids"
              color="#3b82f6"
              trend={currentData.tds < 250 ? 'stable' : 'up'}
            />
            <MetricCard
              icon={Thermometer}
              label="Temperature"
              value={`${currentData.temperature.toFixed(1)}°C`}
              subtitle="Water Temperature"
              color="#f59e0b"
              trend="stable"
            />
            <MetricCard
              icon={TestTube}
              label="pH Level"
              value={currentData.ph.toFixed(1)}
              subtitle="Key Indicator of Water Quality"
              color="#8b5cf6"
              trend={currentData.ph >= 6.5 && currentData.ph <= 8.5 ? 'stable' : 'up'}
            />
          </div>
        </div>

        {/* Alert Logic */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={24} className="text-orange-500" />
            Alert Logic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-2">pH Threshold</div>
              <div className="text-sm text-purple-700">pH &lt; 6.5 or &gt; 8.5</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">TDS Threshold</div>
              <div className="text-sm text-blue-700">TDS &gt; 300 ppm</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="font-semibold text-orange-900 mb-2">Temperature Threshold</div>
              <div className="text-sm text-orange-700">Temperature &gt; 35°C</div>
            </div>
          </div>
        </div>

        {/* Real-Time Sensor Readings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Real-Time Sensor Readings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            <CircularProgress
              value={currentData.tds}
              max={500}
              label="TDS (Total Dissolved Solids)"
              unit="ppm"
              color="#3b82f6"
              warningThreshold={300}
              dangerThreshold={400}
            />
            <CircularProgress
              value={currentData.temperature}
              max={40}
              label="Water Temperature"
              unit="°C"
              color="#f59e0b"
              warningThreshold={30}
              dangerThreshold={35}
            />
            <CircularProgress
              value={currentData.ph}
              max={14}
              label="pH Level"
              unit=""
              color="#8b5cf6"
              warningThreshold={8.5}
              dangerThreshold={9.5}
            />
          </div>
        </div>

        {/* Trend Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Trend Analysis (Last 1 Hour)</h2>
          </div>
          <SensorChart 
            data={historicalData}
            title=""
          />
        </div>

        {/* Alert History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alert History</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-5 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-1">{criticalAlerts}</div>
              <div className="text-sm font-medium text-red-700">Critical Alerts</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-5 text-center border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-1">{warnings}</div>
              <div className="text-sm font-medium text-orange-700">Warnings</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-5 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalEvents}</div>
              <div className="text-sm font-medium text-blue-700">Total Events</div>
            </div>
          </div>
        </div>

        {/* AI Feature Highlight */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain size={32} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900 mb-2">AI-Powered Intelligence</h3>
              <p className="text-sm text-purple-700">
                AI-based analysis for anomaly detection and environmental risk prediction. 
                Our system uses machine learning algorithms to identify patterns and predict potential threats before they become critical.
              </p>
            </div>
          </div>
        </div>

        {/* About the System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">About the System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-4">What We Monitor</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">TDS (Total Dissolved Solids)</div>
                    <div className="text-sm text-gray-600">Measures water purity. Ideal range: 150-250 ppm</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Thermometer size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Temperature</div>
                    <div className="text-sm text-gray-600">Affects aquatic life and oxygen levels. Ideal: 20-28°C</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TestTube size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">pH Level</div>
                    <div className="text-sm text-gray-600">Indicates acidity/alkalinity. Ideal range: 6.5-8.5</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">System Features</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Real-time data collection via IoT sensors
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  AI-based anomaly detection and risk prediction
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Cloud-based data storage and analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Automated alert system for quick response
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Historical trend analysis and reporting
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Integration with Blynk IoT platform
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Flow */}
        <SystemFlow />

        {/* Footer */}
        <div className="text-center py-6 text-sm text-gray-500">
          <p>Last updated: {lastUpdate.toLocaleTimeString('en-US')} | Data updates every 5-6 minutes</p>
          <p className="mt-1">Powered by AI & IoT | Protecting wetland biodiversity through smart monitoring</p>
        </div>
      </main>
    </div>
  );
}
