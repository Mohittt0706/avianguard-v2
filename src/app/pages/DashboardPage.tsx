import { Routes, Route } from 'react-router';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
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
  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <Sidebar />

      <main className="ml-56 min-h-screen">
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-2">
          <div className="flex items-center justify-end">
            <ProfileMenu />
          </div>
        </div>
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
