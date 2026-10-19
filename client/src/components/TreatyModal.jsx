import { useState } from 'react';
import { X, ShieldCheck, DollarSign, Building } from 'lucide-react';

export const TreatyModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    treatyName: '',
    treatyType: 'EXCESS_OF_LOSS',
    lineOfBusiness: 'PROPERTY',
    cedentName: '',
    brokerName: '',
    attachmentPoint: '',
    limit: '',
    grossPremium: '',
    inceptionDate: '2026-01-01',
    expiryDate: '2026-12-31',
    underwriter: 'Eleanor Vance, FCAS',
    underwriterNotes: '',
    currency: 'USD',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.treatyName.trim()) {
      setError('Please provide a Treaty or Policy name');
      return;
    }
    if (!formData.cedentName.trim()) {
      setError('Please specify the Ceding Company (Cedent)');
      return;
    }
    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      setError('Please provide a valid policy limit');
      return;
    }

    onSave({
      ...formData,
      attachmentPoint: parseFloat(formData.attachmentPoint) || 0,
      limit: parseFloat(formData.limit) || 0,
      grossPremium: parseFloat(formData.grossPremium) || 0,
      status: 'UNDER_REVIEW',
      lossRatio: 0.0,
      combinedRatio: 78.5,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">New Reinsurance Treaty / Facultative</h3>
              <p className="text-xs text-slate-500">Draft and submit reinsurance treaty structure for underwriting approval</p>
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
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Treaty / Policy Name *</label>
              <input
                type="text"
                name="treatyName"
                value={formData.treatyName}
                onChange={handleChange}
                placeholder="e.g. North America Property Catastrophe Layer 2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Structure Type</label>
              <select
                name="treatyType"
                value={formData.treatyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="EXCESS_OF_LOSS">Excess of Loss (XoL)</option>
                <option value="QUOTA_SHARE">Quota Share (Proportional)</option>
                <option value="SURPLUS">Surplus Treaty</option>
                <option value="STOP_LOSS">Aggregate Stop Loss</option>
                <option value="FACULTATIVE">Facultative Placement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Line of Business</label>
              <select
                name="lineOfBusiness"
                value={formData.lineOfBusiness}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PROPERTY">Property & Catastrophe</option>
                <option value="CASUALTY">Casualty & General Liability</option>
                <option value="LIFE_HEALTH">Life & Health</option>
                <option value="MARINE_ENERGY">Marine, Aviation & Energy</option>
                <option value="SPECIALTY">Specialty & Cyber</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ceding Insurer (Cedent) *</label>
              <input
                type="text"
                name="cedentName"
                value={formData.cedentName}
                onChange={handleChange}
                placeholder="e.g. Travelers Indemnity Corp"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reinsurance Broker</label>
              <input
                type="text"
                name="brokerName"
                value={formData.brokerName}
                onChange={handleChange}
                placeholder="e.g. Aon Reinsurance / Guy Carpenter"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment Point ($)</label>
              <input
                type="number"
                name="attachmentPoint"
                value={formData.attachmentPoint}
                onChange={handleChange}
                placeholder="e.g. 25000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Treaty Limit ($) *</label>
              <input
                type="number"
                name="limit"
                value={formData.limit}
                onChange={handleChange}
                placeholder="e.g. 75000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Premium / Est. Premium ($)</label>
              <input
                type="number"
                name="grossPremium"
                value={formData.grossPremium}
                onChange={handleChange}
                placeholder="e.g. 4250000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inception Date</label>
              <input
                type="date"
                name="inceptionDate"
                value={formData.inceptionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriter Notes & Technical Terms</label>
              <textarea
                name="underwriterNotes"
                value={formData.underwriterNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Add special conditions, reinstatement clauses, or actuarial pricing assumptions..."
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/20 transition"
            >
              Create Treaty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatyModal;
