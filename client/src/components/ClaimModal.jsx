import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const ClaimModal = ({ isOpen, onClose, onSave, treaties = [] }) => {
  const [formData, setFormData] = useState({
    treatyCode: treaties[0]?.treatyCode || 'TRT-2026-NA-01',
    cedentName: treaties[0]?.cedentName || 'Travelers Indemnity Corp',
    eventDescription: '',
    lossDate: new Date().toISOString().split('T')[0],
    grossLossAmount: '',
    reinsuranceCededAmount: '',
    paidAmount: '0',
    outstandingReserve: '',
    catEventCode: '',
    adjusterNotes: '',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'treatyCode') {
      const selected = treaties.find((t) => t.treatyCode === value);
      setFormData((prev) => ({
        ...prev,
        treatyCode: value,
        cedentName: selected ? selected.cedentName : prev.cedentName,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.eventDescription.trim()) {
      setError('Please provide a loss event description');
      return;
    }
    if (!formData.grossLossAmount || parseFloat(formData.grossLossAmount) <= 0) {
      setError('Please enter a valid Gross Loss amount');
      return;
    }
    if (!formData.reinsuranceCededAmount || parseFloat(formData.reinsuranceCededAmount) <= 0) {
      setError('Please enter a valid Ceded Loss amount');
      return;
    }

    const ceded = parseFloat(formData.reinsuranceCededAmount) || 0;
    const paid = parseFloat(formData.paidAmount) || 0;
    const reserve = formData.outstandingReserve ? parseFloat(formData.outstandingReserve) : Math.max(0, ceded - paid);

    onSave({
      ...formData,
      grossLossAmount: parseFloat(formData.grossLossAmount) || 0,
      reinsuranceCededAmount: ceded,
      paidAmount: paid,
      outstandingReserve: reserve,
      status: 'REPORTED',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">First Notice of Loss / Claim Ingestion</h3>
              <p className="text-xs text-slate-500">Record ceded loss advice from primary ceding insurance partner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attached Treaty</label>
              <select
                name="treatyCode"
                value={formData.treatyCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {treaties.map((t) => (
                  <option key={t.id} value={t.treatyCode}>
                    {t.treatyCode} - {t.treatyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ceding Insurer</label>
              <input
                type="text"
                name="cedentName"
                value={formData.cedentName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                readOnly
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loss Event Description *</label>
              <input
                type="text"
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
                placeholder="e.g. Florida Commercial Port Windstorm & Surge Damage"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Loss</label>
              <input
                type="date"
                name="lossDate"
                value={formData.lossDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CAT Event Reference (Optional)</label>
              <input
                type="text"
                name="catEventCode"
                value={formData.catEventCode}
                onChange={handleChange}
                placeholder="e.g. CAT-2026-02"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Ground-Up Loss ($) *</label>
              <input
                type="number"
                name="grossLossAmount"
                value={formData.grossLossAmount}
                onChange={handleChange}
                placeholder="e.g. 25000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ceded Reinsurance Loss ($) *</label>
              <input
                type="number"
                name="reinsuranceCededAmount"
                value={formData.reinsuranceCededAmount}
                onChange={handleChange}
                placeholder="e.g. 5000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loss Adjuster Initial Notes</label>
              <textarea
                name="adjusterNotes"
                value={formData.adjusterNotes}
                onChange={handleChange}
                rows={2}
                placeholder="Initial claim assessment and reserve adequacy commentary..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-rose-500/20 transition"
            >
              Submit Claim Advice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
