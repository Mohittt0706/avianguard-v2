import { useNavigate, Routes, Route } from 'react-router';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHome } from '../components/dashboard/DashboardHome';
import { AIAlertsPage } from '../components/dashboard/AIAlertsPage';
import { LiveSensorsPage } from '../components/dashboard/LiveSensorsPage';
import { MapsPage } from '../components/dashboard/MapsPage';
import { ReportsPage } from '../components/dashboard/ReportsPage';
import { UserManagementPage } from '../components/dashboard/UserManagementPage';
import { CitizenRequestsPage } from '../components/dashboard/CitizenRequestsPage';
import { SettingsPage } from '../components/dashboard/SettingsPage';
import { AlertCenterPage } from '../components/dashboard/AlertCenterPage';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <Sidebar onSignOut={() => navigate('/')} />

      <main className="ml-56 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="alerts" element={<AIAlertsPage />} />
            <Route path="sensors" element={<LiveSensorsPage />} />
            <Route path="maps" element={<MapsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="citizens" element={<CitizenRequestsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="alert-center" element={<AlertCenterPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
