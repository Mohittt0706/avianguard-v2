import { useState, useEffect } from 'react';
import { Droplets, Thermometer, Activity, TestTube, Wifi, MapPin, CheckCircle, AlertTriangle, Brain, TrendingUp, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CircularProgress } from '../components/CircularProgress';
import { MetricCard } from '../components/MetricCard';
import { SensorChart } from '../components/SensorChart';
import { SystemFlow } from '../components/SystemFlow';

interface SensorData {
  tds: number;
  temperature: number;
  ph: number;
  timestamp: Date;
}

function generateSensorData(): SensorData {
  return {
    tds: 150 + Math.random() * 100,
    temperature: 22 + Math.random() * 8,
    ph: 6.5 + Math.random() * 2,
    timestamp: new Date()
  };
}

let dataIdCounter = 0;

export default function DashboardPage() {
  const navigate = useNavigate();
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
  const [criticalAlerts, setCriticalAlerts] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

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

  const getHealthStatus = () => {
    const tdsHealthy = currentData.tds < 300;
    const tempHealthy = currentData.temperature >= 20 && currentData.temperature <= 30;
    const phHealthy = currentData.ph >= 6.5 && currentData.ph <= 8.5;
    if (tdsHealthy && tempHealthy && phHealthy) return 'Excellent';
    if ((tdsHealthy && tempHealthy) || (tdsHealthy && phHealthy) || (tempHealthy && phHealthy)) return 'Good';
    if (tdsHealthy || tempHealthy || phHealthy) return 'Fair';
    return 'Poor';
  };

  useEffect(() => {
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

    const interval = setInterval(() => {
      const newData = generateSensorData();
      setCurrentData(newData);
      setLastUpdate(new Date());
      const threats = checkThreats(newData);
      setCriticalAlerts(prev => prev + threats.critical);
      setWarnings(prev => prev + threats.warn);
      setTotalEvents(prev => prev + threats.critical + threats.warn);
      dataIdCounter++;
      setHistoricalData(prev => [
        ...prev.slice(-11),
        {
          id: `data-${dataIdCounter}`,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          tds: newData.tds,
          temperature: newData.temperature,
          ph: newData.ph
        }
      ]);
      setIsConnected(Math.random() > 0.05);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const healthStatus = getHealthStatus();
  const isHealthy = healthStatus === 'Excellent' || healthStatus === 'Good';

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <Droplets className="text-white" size={16} />
            </div>
            <span className="text-sm font-bold text-white">Avian<span className="text-emerald-400">Guard</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <Wifi size={12} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut size={14} />
              Exit
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Droplets className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Smart Wetland Guardian Dashboard
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Real-Time Wetland Monitoring using AI & IoT
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={14} className="text-gray-500" />
                <span>Pilot Location: Village Wetland (Prototype Testing Zone)</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-5 ${isHealthy ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-orange-500/5 border border-orange-500/20'}`}>
            <div className="flex items-center gap-4">
              {isHealthy ? (
                <CheckCircle size={36} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle size={36} className="text-orange-400 flex-shrink-0" />
              )}
              <div>
                <h2 className={`text-lg font-bold ${isHealthy ? 'text-emerald-300' : 'text-orange-300'}`}>
                  System Status: {isHealthy ? 'Healthy Ecosystem' : 'Attention Required'}
                </h2>
                <p className={`text-sm mt-0.5 ${isHealthy ? 'text-emerald-400/70' : 'text-orange-400/70'}`}>
                  {isHealthy ? 'No environmental threats detected' : 'Some parameters need attention'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Activity} label="Wetland Health" value={healthStatus} subtitle="Stable" color="#10b981" trend="stable" />
            <MetricCard icon={Droplets} label="Water Quality (TDS)" value={`${currentData.tds.toFixed(0)} ppm`} subtitle="Total Dissolved Solids" color="#3b82f6" trend={currentData.tds < 250 ? 'stable' : 'up'} />
            <MetricCard icon={Thermometer} label="Temperature" value={`${currentData.temperature.toFixed(1)}°C`} subtitle="Water Temperature" color="#f59e0b" trend="stable" />
            <MetricCard icon={TestTube} label="pH Level" value={currentData.ph.toFixed(1)} subtitle="Key Indicator of Water Quality" color="#8b5cf6" trend={currentData.ph >= 6.5 && currentData.ph <= 8.5 ? 'stable' : 'up'} />
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" />
            Alert Logic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <div className="font-semibold text-purple-300 mb-2">pH Threshold</div>
              <div className="text-sm text-purple-400/70">pH &lt; 6.5 or &gt; 8.5</div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="font-semibold text-blue-300 mb-2">TDS Threshold</div>
              <div className="text-sm text-blue-400/70">TDS &gt; 300 ppm</div>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
              <div className="font-semibold text-orange-300 mb-2">Temperature Threshold</div>
              <div className="text-sm text-orange-400/70">Temperature &gt; 35°C</div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
          <h2 className="text-lg font-bold text-white mb-6 text-center">Real-Time Sensor Readings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            <CircularProgress value={currentData.tds} max={500} label="TDS (Total Dissolved Solids)" unit="ppm" color="#3b82f6" warningThreshold={300} dangerThreshold={400} />
            <CircularProgress value={currentData.temperature} max={40} label="Water Temperature" unit="°C" color="#f59e0b" warningThreshold={30} dangerThreshold={35} />
            <CircularProgress value={currentData.ph} max={14} label="pH Level" unit="" color="#8b5cf6" warningThreshold={8.5} dangerThreshold={9.5} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Trend Analysis (Last 1 Hour)</h2>
          </div>
          <SensorChart data={historicalData} title="" />
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
          <h2 className="text-lg font-bold text-white mb-4">Alert History</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-500/5 rounded-lg p-5 text-center border border-red-500/20">
              <div className="text-3xl font-bold text-red-400 mb-1">{criticalAlerts}</div>
              <div className="text-sm font-medium text-red-400/70">Critical Alerts</div>
            </div>
            <div className="bg-orange-500/5 rounded-lg p-5 text-center border border-orange-500/20">
              <div className="text-3xl font-bold text-orange-400 mb-1">{warnings}</div>
              <div className="text-sm font-medium text-orange-400/70">Warnings</div>
            </div>
            <div className="bg-blue-500/5 rounded-lg p-5 text-center border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-400 mb-1">{totalEvents}</div>
              <div className="text-sm font-medium text-blue-400/70">Total Events</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5 rounded-2xl p-6 border border-white/[0.06]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl flex-shrink-0">
              <Brain size={28} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">AI-Powered Intelligence</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-based analysis for anomaly detection and environmental risk prediction.
                Our system uses machine learning algorithms to identify patterns and predict potential threats before they become critical.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
          <h2 className="text-lg font-bold text-white mb-6">About the System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-emerald-400 mb-4">What We Monitor</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">TDS (Total Dissolved Solids)</div>
                    <div className="text-xs text-gray-500">Measures water purity. Ideal range: 150-250 ppm</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Thermometer size={16} className="text-orange-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Temperature</div>
                    <div className="text-xs text-gray-500">Affects aquatic life and oxygen levels. Ideal: 20-28°C</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TestTube size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">pH Level</div>
                    <div className="text-xs text-gray-500">Indicates acidity/alkalinity. Ideal range: 6.5-8.5</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-blue-400 mb-4">System Features</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />Real-time data collection via IoT sensors</div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />AI-based anomaly detection and risk prediction</div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />Cloud-based data storage and analysis</div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />Automated alert system for quick response</div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />Historical trend analysis and reporting</div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />Integration with Blynk IoT platform</div>
              </div>
            </div>
          </div>
        </div>

        <SystemFlow />

        <div className="text-center py-4 text-sm text-gray-500">
          <p>Last updated: {lastUpdate.toLocaleTimeString('en-US')} | Data updates every 5-6 minutes</p>
          <p className="mt-1">Powered by AI & IoT | Protecting wetland biodiversity through smart monitoring</p>
        </div>
      </main>
    </div>
  );
}
