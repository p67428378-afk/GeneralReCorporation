import { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Shield,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import TreatyModal from '../components/TreatyModal';

export const TreatiesPage = () => {
  const [treaties, setTreaties] = useState([]);
  const [filteredTreaties, setFilteredTreaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreaty, setSelectedTreaty] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lobFilter, setLobFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTreaties = async () => {
    setLoading(true);
    try {
      const data = await api.getTreaties();
      setTreaties(data);
      setFilteredTreaties(data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreaties();
  }, []);

  useEffect(() => {
    let result = [...treaties];
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (lobFilter !== 'ALL') {
      result = result.filter((t) => t.lineOfBusiness === lobFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.treatyName.toLowerCase().includes(q) ||
          t.treatyCode.toLowerCase().includes(q) ||
          t.cedentName.toLowerCase().includes(q) ||
          t.underwriter.toLowerCase().includes(q)
      );
    }
    setFilteredTreaties(result);
  }, [statusFilter, lobFilter, searchQuery, treaties]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.updateTreatyStatus(id, newStatus);
      setTreaties((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (selectedTreaty && selectedTreaty.id === id) {
        setSelectedTreaty(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTreaty = async (data) => {
    const created = await api.createTreaty(data);
    setTreaties((prev) => [created, ...prev]);
    setSelectedTreaty(created);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            <span>Reinsurance Treaties & Facultative Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage quota share, excess of loss layers, surplus commitments, and facultative endorsements.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Treaty / Policy</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search treaty code, name, cedent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-md px-2.5 py-1 text-xs bg-slate-50 font-semibold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="BOUND">Bound</option>
              <option value="APPROVED">Approved</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span>Line of Business:</span>
            <select
              value={lobFilter}
              onChange={(e) => setLobFilter(e.target.value)}
              className="border border-slate-300 rounded-md px-2.5 py-1 text-xs bg-slate-50 font-semibold focus:outline-none"
            >
              <option value="ALL">All Lines</option>
              <option value="PROPERTY">Property</option>
              <option value="CASUALTY">Casualty</option>
              <option value="LIFE_HEALTH">Life & Health</option>
              <option value="MARINE_ENERGY">Marine & Energy</option>
              <option value="SPECIALTY">Specialty / Cyber</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table and Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${selectedTreaty ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Treaty Reference</th>
                  <th className="py-3 px-4">Cedent / Broker</th>
                  <th className="py-3 px-4">LOB & Type</th>
                  <th className="py-3 px-4 text-right">Capacity ($)</th>
                  <th className="py-3 px-4 text-right">Premium ($)</th>
                  <th className="py-3 px-4 text-center">Combined %</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTreaties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No treaties match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTreaties.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTreaty(t)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition ${
                        selectedTreaty?.id === t.id ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{t.treatyCode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.treatyName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{t.cedentName}</div>
                        <div className="text-[10px] text-slate-400">{t.brokerName || 'Direct'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{t.lineOfBusiness.replace('_', ' ')}</div>
                        <span className="text-[10px] text-slate-500">{t.treatyType.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${(t.limit / 1000000).toFixed(1)}M
                        {t.attachmentPoint > 0 && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            att. ${(t.attachmentPoint / 1000000).toFixed(1)}M
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        ${(t.grossPremium / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {t.combinedRatio ? `${t.combinedRatio}%` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
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
                      <td className="py-3.5 px-4 text-center">
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-auto" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Treaty Detailed Inspection Panel */}
        {selectedTreaty && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Treaty Overview</span>
                <h3 className="text-base font-bold text-slate-900">{selectedTreaty.treatyCode}</h3>
              </div>
              <button
                onClick={() => setSelectedTreaty(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Close &times;
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium">{selectedTreaty.treatyName}</p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Ceding Partner</span>
                <span className="font-bold text-slate-800">{selectedTreaty.cedentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Broker</span>
                <span className="font-bold text-slate-800">{selectedTreaty.brokerName || 'Direct Placement'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Treaty Capacity / Limit</span>
                <span className="font-bold text-blue-700">${selectedTreaty.limit?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Attachment / Deductible</span>
                <span className="font-bold text-slate-800">${selectedTreaty.attachmentPoint?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Gross Premium</span>
                <span className="font-bold text-emerald-700">${selectedTreaty.grossPremium?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Combined Ratio</span>
                <span className="font-bold text-slate-800">{selectedTreaty.combinedRatio}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Inception Date</span>
                <span className="font-medium text-slate-800">{selectedTreaty.inceptionDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                <span className="font-medium text-slate-800">{selectedTreaty.expiryDate}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Underwriter Assessment:</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                "{selectedTreaty.underwriterNotes || 'No specific underwriting notes entered.'}"
              </p>
              <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                Lead Actuary / UW: {selectedTreaty.underwriter}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Underwriting Status Workflow:</span>
              <div className="flex flex-wrap gap-2">
                {['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'BOUND'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedTreaty.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedTreaty.status === st
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <TreatyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateTreaty}
      />
    </div>
  );
};

export default TreatiesPage;
