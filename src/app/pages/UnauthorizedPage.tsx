import { useNavigate } from 'react-router';
import { Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.06)_0%,_transparent_60%)]" />
      <div className="relative text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <Shield size={40} className="text-red-400" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">403</h1>
        <h2 className="text-lg font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 mb-6">
          You do not have the required permissions to access this resource. Contact your administrator if you believe this is a mistake.
        </p>
        <button onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
