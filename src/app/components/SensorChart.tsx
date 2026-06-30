import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SensorChartProps {
  data: Array<{
    id: string;
    time: string;
    tds: number;
    temperature: number;
    ph: number;
  }>;
  title: string;
}

export function SensorChart({ data, title }: SensorChartProps) {
  // Create a unique key based on all data IDs to force complete remount
  const chartKey = data.map(d => d.id).join(',');

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/[0.06] p-6">
      {title && <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} key={chartKey}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            stroke="#4b5563"
          />
          <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="tds" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="TDS (ppm)"
            dot={false}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Temperature (°C)"
            dot={false}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="ph" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="pH"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
