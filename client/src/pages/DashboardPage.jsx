import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Flame,
  ArrowRight,
  Plus,
  RefreshCw,
  Building2,
  FileCheck2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import TreatyModal from '../components/TreatyModal';
import ClaimModal from '../components/ClaimModal';
import PricingCalculatorModal from '../components/PricingCalculatorModal';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [treaties, setTreaties] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treatyModalOpen, setTreatyModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anData, trtData, clmData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getTreaties(),
        api.getClaims(),
      ]);
      setAnalytics(anData);
      setTreaties(trtData);
      setClaims(clmData);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTreaty = async (data) => {
    await api.createTreaty(data);
    fetchData();
  };

  const handleCreateClaim = async (data) => {
    await api.createClaim(data);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-1 tracking-wide uppercase">
            <span>Berkshire Hathaway Reinsurance Division</span>
            <span>&bull;</span>
            <span className="text-emerald-400">Capital Adequacy: AAA Quality</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">General Reinsurance Executive Operations</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time underwriting portfolio health, catastrophe peril accumulation, and global treaty commitments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setPricingModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Risk Pricing Engine</span>
          </button>

          <button
            onClick={() => setClaimModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-semibold transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Ingest Claim</span>
          </button>

          <button
            onClick={() => setTreatyModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Reinsurance Treaty</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gross Written Premium"
          value={analytics ? `$${(analytics.grossWrittenPremium / 1000000000).toFixed(2)}B` : '$14.20B'}
          subtitle="Net Earned Premium: $12.85B"
          trend={{ value: '+8.4% YoY', isPositive: true }}
          icon={DollarSign}
          color="blue"
        />

        <MetricCard
          title="Combined Ratio"
          value={analytics ? `${analytics.combinedRatio}%` : '89.4%'}
          subtitle={`Loss Ratio: ${analytics?.lossRatio || 58.2}% | Exp: ${analytics?.expenseRatio || 31.2}%`}
          trend={{ value: '-2.1% Impv', isPositive: true }}
          icon={TrendingUp}
          color="emerald"
        />

        <MetricCard
          title="Underwriting Profit"
          value={analytics ? `$${(analytics.underwritingProfit / 1000000).toFixed(0)}M` : '$1,362M'}
          subtitle="Operating RoE: 14.8%"
          trend={{ value: '+12.5%', isPositive: true }}
          icon={ShieldCheck}
          color="indigo"
        />

        <MetricCard
          title="Solvency II Coverage"
          value={analytics ? `${analytics.solvencyCoverageRatio}%` : '268.5%'}
          subtitle={`Capital Surplus: $${analytics ? (analytics.capitalSurplus / 1000000000).toFixed(1) : '18.9'}B`}
          trend={{ value: 'Robust', isPositive: true }}
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* Main Grid: Active Treaties and Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Reinsurance Treaties */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <span>Active Treaties & Facultative Commitments</span>
              </h2>
              <p className="text-xs text-slate-500">Live treaties bound or undergoing actuarial underwriting review</p>
            </div>
            <Link
              to="/treaties"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Treaty Code / Name</th>
                  <th className="py-2.5 px-3">Cedent</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Limit ($)</th>
                  <th className="py-2.5 px-3 text-right">Premium ($)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {treaties.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{t.treatyCode}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.treatyName}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{t.cedentName}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[10px]">
                        {t.treatyType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      ${(t.limit / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      ${(t.grossPremium / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          t.status === 'BOUND'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : t.status === 'UNDER_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Ceded Claims & CAT Accumulation */}
        <div className="space-y-6">
          {/* Claims Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Recent Ceded Loss Notices</span>
              </h2>
              <Link to="/claims" className="text-xs text-blue-600 hover:underline font-medium">
                Details &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {claims.slice(0, 3).map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{c.claimNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.status === 'SETTLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 mb-1.5">{c.eventDescription}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Cedent: {c.cedentName}</span>
                    <span className="font-bold text-rose-600">${(c.reinsuranceCededAmount / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peril Accumulation Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>CAT Peril Risk Distribution</span>
            </h2>

            <div className="space-y-2.5">
              {analytics?.perilDistribution.map((p) => (
                <div key={p.peril}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{p.peril}</span>
                    <span className="font-bold text-slate-900">{p.share}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${p.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TreatyModal
        isOpen={treatyModalOpen}
        onClose={() => setTreatyModalOpen(false)}
        onSave={handleCreateTreaty}
      />

      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSave={handleCreateClaim}
        treaties={treaties}
      />

      <PricingCalculatorModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
