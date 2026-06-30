import { Radio, Cpu, Cloud, Brain, LayoutDashboard, Bell } from 'lucide-react';

export function SystemFlow() {
  const steps = [
    { icon: Radio, label: 'Sensors', color: '#10b981' },
    { icon: Cpu, label: 'ESP32', color: '#3b82f6' },
    { icon: Cloud, label: 'Cloud', color: '#8b5cf6' },
    { icon: Brain, label: 'AI Analysis', color: '#f59e0b' },
    { icon: LayoutDashboard, label: 'Dashboard', color: '#06b6d4' },
    { icon: Bell, label: 'Alerts', color: '#ef4444' },
  ];

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">System Flow</h3>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}` }}
              >
                <step.icon size={28} style={{ color: step.color }} />
              </div>
              <div className="text-xs font-semibold text-gray-700">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="text-2xl font-bold text-gray-300">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}