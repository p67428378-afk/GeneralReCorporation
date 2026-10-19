import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  DollarSign,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAnalyticsSummary();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Portfolio Profitability & Actuarial Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics on Gross Written Premium, technical loss ratios, expense allocations, and Solvency II capital adequacy.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Earned Premium (NEP)"
          value={analytics ? `$${(analytics.netEarnedPremium / 1000000000).toFixed(2)}B` : '$12.85B'}
          subtitle="90.5% Retention Ratio"
          trend={{ value: '+7.2% YoY', isPositive: true }}
          icon={DollarSign}
          color="blue"
        />

        <MetricCard
          title="Consolidated Loss Ratio"
          value={analytics ? `${analytics.lossRatio}%` : '58.2%'}
          subtitle="Catastrophe load: 8.4%"
          trend={{ value: 'Target <60%', isPositive: true }}
          icon={TrendingUp}
          color="emerald"
        />

        <MetricCard
          title="Expense Ratio"
          value={analytics ? `${analytics.expenseRatio}%` : '31.2%'}
          subtitle="Brokerage & Admin"
          trend={{ value: 'Stable', isPositive: true }}
          icon={Layers}
          color="indigo"
        />

        <MetricCard
          title="Total Capital Surplus"
          value={analytics ? `$${(analytics.capitalSurplus / 1000000000).toFixed(1)}B` : '$18.9B'}
          subtitle="Berkshire Hathaway backing"
          trend={{ value: 'AAA Depth', isPositive: true }}
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* Line of Business Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          <span>Line of Business Premium & Combined Ratio Performance</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Line of Business</th>
                <th className="py-3 px-4">Portfolio Share (%)</th>
                <th className="py-3 px-4 text-right">Gross Written Premium</th>
                <th className="py-3 px-4 text-center">Combined Ratio</th>
                <th className="py-3 px-4 text-center">Profitability Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {analytics?.lineOfBusinessBreakdown.map((item) => (
                <tr key={item.line} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.line}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span>{item.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ${(item.premium / 1000000000).toFixed(2)}B
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                    {item.combinedRatio}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      High Return
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
