import { useState, useEffect } from 'react';
import {
  Flame,
  Globe2,
  TrendingDown,
  ShieldAlert,
  Wind,
  Waves,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export const CatExposurePage = () => {
  const [catEvents, setCatEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getCatEvents();
        setCatEvents(data);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-500" />
          <span>Global Catastrophe (CAT) & Event Accumulation</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track natural perils, named windstorms, earthquake accumulation, and multi-line cyber accumulation scenarios.
        </p>
      </div>

      {/* Top CAT Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Catastrophes (YTD)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{catEvents.length} Events</h3>
          <p className="text-xs text-slate-500 mt-1">Accumulated industry loss ~$12.3B</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Gen Re Modeled Net CAT Loss</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-700">
            ${(catEvents.reduce((acc, e) => acc + e.genreEstimatedNetLoss, 0) / 1000000).toFixed(1)}M
          </h3>
          <p className="text-xs text-slate-500 mt-1">Within annual 1-in-100 Aggregate Budget</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Retrocession Recovery Est.</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">$45.0M</h3>
          <p className="text-xs text-slate-500 mt-1">Berkshire Hathaway Group retro protection</p>
        </div>
      </div>

      {/* Catastrophe Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Globe2 className="w-5 h-5 text-blue-600" />
          <span>Active Named CAT Events & Accumulation Ledger</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event Code / Name</th>
                <th className="py-3 px-4">Peril Type</th>
                <th className="py-3 px-4">Affected Region</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4 text-right">Industry Loss Est.</th>
                <th className="py-3 px-4 text-right">Gen Re Net Est.</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {catEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{e.eventCode}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{e.eventName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{e.perilType}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{e.region}</td>
                  <td className="py-3.5 px-4 text-slate-600">{e.eventDate}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                    ${(e.industryEstimatedLoss / 1000000000).toFixed(2)}B
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                    ${(e.genreEstimatedNetLoss / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {e.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peril Accumulation Zones & Stress Testing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Wind className="w-4 h-4 text-blue-600" />
            <span>Peak Peril Accumulation Limits</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>US Atlantic Coast Hurricane</span>
                <span className="text-slate-900">$480M / $600M Cap (80%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>California & Cascadia Earthquake</span>
                <span className="text-slate-900">$320M / $500M Cap (64%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>European Windstorm (All Perils)</span>
                <span className="text-slate-900">$210M / $400M Cap (52.5%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '52.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Global Cloud & Cyber Aggregation</span>
                <span className="text-slate-900">$185M / $250M Cap (74%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Stress Test & Capital Surplus Resilience</span>
          </h3>
          <p className="text-xs text-slate-500">
            Gen Re's balance sheet maintains exceptional capital depth through Berkshire Hathaway sponsorship.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Statutory Capital Surplus:</span>
              <span className="font-bold text-slate-900">$18.9 Billion</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Simulated 1-in-250 Year CAT Impact:</span>
              <span className="font-bold text-rose-700">-$1.45 Billion (7.6% of Surplus)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Post-Stress Solvency II Ratio:</span>
              <span className="font-bold text-emerald-700">234.0% (Well above regulatory 100%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatExposurePage;
