import { Routes, Route } from 'react-router';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { DashboardHome } from '../components/dashboard/DashboardHome';
import { AIAlertsPage } from '../components/dashboard/AIAlertsPage';
import { LiveSensorsPage } from '../components/dashboard/LiveSensorsPage';
import { MapsPage } from '../components/dashboard/MapsPage';
import { ReportsPage } from '../components/dashboard/ReportsPage';
import { ReportPreviewPage } from '../components/dashboard/ReportPreviewPage';
import { UserManagementPage } from '../components/dashboard/UserManagementPage';
import { UserDetailsPage } from '../components/dashboard/UserDetailsPage';
import { CitizenRequestsPage } from '../components/dashboard/CitizenRequestsPage';
import { CitizenProfilePage } from '../components/dashboard/CitizenProfilePage';
import { SettingsPage } from '../components/dashboard/SettingsPage';
import { AlertCenterPage } from '../components/dashboard/AlertCenterPage';
import { AlertDetailsPage } from '../components/dashboard/AlertDetailsPage';
import { AlertToastNotification } from '../components/dashboard/AlertToastNotification';

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
          <AlertToastNotification />
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="alerts" element={<AlertCenterPage />} />
            <Route path="alerts/:alertId" element={<AlertDetailsPage />} />
            <Route path="ai" element={<AIAlertsPage />} />
            <Route path="alert-center" element={<AlertCenterPage />} />
            <Route path="sensors" element={<LiveSensorsPage />} />
            <Route path="maps" element={<MapsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:reportId" element={<ReportPreviewPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="users/:userId" element={<UserDetailsPage />} />
            <Route path="citizens" element={<CitizenRequestsPage />} />
            <Route path="citizens/:citizenId" element={<CitizenProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
