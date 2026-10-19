import { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  Search,
  Award,
  TrendingUp,
  ExternalLink,
  Users
} from 'lucide-react';
import { api } from '../services/api';

export const CedentsPage = () => {
  const [cedents, setCedents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCedents = async () => {
      try {
        const data = await api.getCedents();
        setCedents(data);
      } finally {
        setLoading(false);
      }
    };
    fetchCedents();
  }, []);

  const filteredCedents = cedents.filter((c) =>
    c.cedentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.headquarters.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <span>Ceding Companies & Reinsurance Brokers</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review counterparty credit strength, A.M. Best / S&P ratings, ceded premium volume, and historical performance.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ceding insurer or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredCedents.length} Partners Registered</span>
      </div>

      {/* Cedents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCedents.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.cedentName}</h3>
                  <p className="text-[11px] text-slate-500">{c.headquarters}</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {c.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-400 block text-[10px]">A.M. Best Rating</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> {c.amBestRating}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">S&P Global Rating</span>
                <span className="font-bold text-slate-900">{c.spRating}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Annual Ceded Premium</span>
                <span className="font-bold text-blue-600">${(c.annualPremiumCeded / 1000000).toFixed(1)}M</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Historical Loss Ratio</span>
                <span className="font-bold text-slate-900">{c.lossRatioHistorical}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span className="font-medium">{c.activeTreatiesCount} Active Treaties</span>
              <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                <span>View Portfolio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CedentsPage;
