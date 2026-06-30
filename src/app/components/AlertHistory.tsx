import { Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { Alert } from './AlertPanel';

interface AlertHistoryProps {
  alerts: Alert[];
}

export function AlertHistory({ alerts }: AlertHistoryProps) {
  const sortedAlerts = [...alerts].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock size={24} />
        Alert History (Last 24 Hours)
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
          <div className="text-sm text-red-700">Critical Alerts</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{warningCount}</div>
          <div className="text-sm text-orange-700">Warnings</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{alerts.length}</div>
          <div className="text-sm text-green-700">Total Events</div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No alerts recorded</p>
        ) : (
          sortedAlerts.map((alert, index) => (
            <div
              key={`${alert.id}-${index}`}
              className="border rounded p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.type === 'critical' && (
                    <TrendingUp className="text-red-500" size={16} />
                  )}
                  {alert.type === 'warning' && (
                    <TrendingDown className="text-orange-500" size={16} />
                  )}
                  <span className="font-medium text-sm">{alert.title}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {alert.timestamp.toLocaleTimeString('en-US')}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1 ml-6">
                {alert.sensor}: {alert.value}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
