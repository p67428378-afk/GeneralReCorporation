import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TreatiesPage from './pages/TreatiesPage';
import UnderwritingWorkbenchPage from './pages/UnderwritingWorkbenchPage';
import ClaimsPage from './pages/ClaimsPage';
import CatExposurePage from './pages/CatExposurePage';
import CedentsPage from './pages/CedentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useState } from 'react';
import { Shield, Lock, Mail } from 'lucide-react';

const LoginView = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl text-white">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Gen Re Underwriting Portal</h2>
          <p className="text-xs text-slate-400 mt-1">A Berkshire Hathaway Reinsurance Company</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-blue-900/30 border border-blue-700/40 rounded-lg text-xs text-blue-300">
            <p className="font-semibold">Test Credentials:</p>
            <p className="text-[11px] text-blue-200 mt-0.5">
              Email: <code className="bg-blue-950 px-1 py-0.5 rounded">test@example.com</code> / Password: <code className="bg-blue-950 px-1 py-0.5 rounded">testpassword</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/treaties" element={<TreatiesPage />} />
            <Route path="/underwriting" element={<UnderwritingWorkbenchPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/cat-exposure" element={<CatExposurePage />} />
            <Route path="/cedents" element={<CedentsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
