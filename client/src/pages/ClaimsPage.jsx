import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  FileText,
  Clock,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import ClaimModal from '../components/ClaimModal';

export const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [treaties, setTreaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const [clmData, trtData] = await Promise.all([
        api.getClaims(),
        api.getTreaties(),
      ]);
      setClaims(clmData);
      setFilteredClaims(clmData);
      setTreaties(trtData);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    let result = [...claims];
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.claimNumber.toLowerCase().includes(q) ||
          c.cedentName.toLowerCase().includes(q) ||
          c.eventDescription.toLowerCase().includes(q) ||
          c.treatyCode.toLowerCase().includes(q)
      );
    }
    setFilteredClaims(result);
  }, [statusFilter, searchQuery, claims]);

  const handleCreateClaim = async (data) => {
    const created = await api.createClaim(data);
    setClaims((prev) => [created, ...prev]);
    setSelectedClaim(created);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.updateClaimStatus(id, newStatus);
      setClaims((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedClaim && selectedClaim.id === id) {
        setSelectedClaim(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Reinsurance Claims & Ceded Loss Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor first notices of loss (FNOL), ceded claim advices, reserve adequacy, and settlement disbursements.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Claim Advice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search claim #, event description, cedent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Claim Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-2.5 py-1 text-xs bg-slate-50 font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported (FNOL)</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="APPROVED">Approved for Payment</option>
            <option value="SETTLED">Settled</option>
          </select>
        </div>
      </div>

      {/* Claims Table and Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${selectedClaim ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Claim Ref / Event</th>
                  <th className="py-3 px-4">Treaty Reference</th>
                  <th className="py-3 px-4">Cedent</th>
                  <th className="py-3 px-4 text-right">Ground-Up Loss</th>
                  <th className="py-3 px-4 text-right">Ceded Loss ($)</th>
                  <th className="py-3 px-4 text-right">Paid ($)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No claims found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClaim(c)}
                      className={`hover:bg-rose-50/40 cursor-pointer transition ${
                        selectedClaim?.id === c.id ? 'bg-rose-50/70 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{c.claimNumber}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.eventDescription}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">{c.treatyCode}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{c.cedentName}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        ${(c.grossLossAmount / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                        ${(c.reinsuranceCededAmount / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                        ${(c.paidAmount / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'IN_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
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

        {/* Selected Claim Drawer */}
        {selectedClaim && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Claim File</span>
                <h3 className="text-base font-bold text-slate-900">{selectedClaim.claimNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Close &times;
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium">{selectedClaim.eventDescription}</p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Ceding Company</span>
                <span className="font-bold text-slate-800">{selectedClaim.cedentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Attached Treaty</span>
                <span className="font-bold text-blue-700">{selectedClaim.treatyCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Ground-Up Loss</span>
                <span className="font-bold text-slate-800">${selectedClaim.grossLossAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ceded Reinsurance Loss</span>
                <span className="font-bold text-rose-700">${selectedClaim.reinsuranceCededAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Paid Amount</span>
                <span className="font-bold text-emerald-700">${selectedClaim.paidAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Outstanding Reserve</span>
                <span className="font-bold text-amber-700">${selectedClaim.outstandingReserve?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Loss Date</span>
                <span className="font-medium text-slate-800">{selectedClaim.lossDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reported Date</span>
                <span className="font-medium text-slate-800">{selectedClaim.reportedDate}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Adjuster / Reserve Notes:</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                "{selectedClaim.adjusterNotes || 'No adjuster notes recorded.'}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Claim Lifecycle State:</span>
              <div className="flex flex-wrap gap-2">
                {['REPORTED', 'IN_REVIEW', 'APPROVED', 'SETTLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedClaim.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedClaim.status === st
                        ? 'bg-rose-600 text-white shadow-sm'
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

      <ClaimModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateClaim}
        treaties={treaties}
      />
    </div>
  );
};

export default ClaimsPage;
