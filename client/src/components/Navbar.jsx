import { Shield, Bell, LogOut, User, Activity, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company identity */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-500 p-2 rounded-lg text-white shadow-md shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Gen Re</span>
                <span className="text-xs bg-blue-900/60 text-blue-300 font-medium px-2 py-0.5 rounded border border-blue-700/50">
                  A Berkshire Hathaway Company
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Reinsurance Underwriting & Risk Management Portal
              </p>
            </div>
          </div>

          {/* Right actions: Financial strength, Notifications & User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Financial Strength:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> A.M. Best A++ / S&P AA+
              </span>
            </div>

            <button
              title="Notifications"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Bell className="w-5 h-5" />
            </button>

            {user && (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role || 'Underwriter'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
