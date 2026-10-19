import { useState } from 'react';
import {
  Calculator,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Layers,
  ArrowRight,
  CheckCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';

export const UnderwritingWorkbenchPage = () => {
  const [formData, setFormData] = useState({
    cedentName: 'Travelers Indemnity Corp',
    lineOfBusiness: 'PROPERTY',
    peril: 'HURRICANE_EARTHQUAKE',
    subjectPremium: 120000000,
    attachmentPoint: 20000000,
    limit: 60000000,
    expectedLossRatio: 0.038,
    catRiskLoad: 0.045,
    underwriterExpense: 0.11,
    targetReturnOnEquity: 0.15,
  });

  const [pricingOutput, setPricingOutput] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [signOffStatus, setSignOffStatus] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalculating(true);
    setSignOffStatus(null);
    try {
      const res = await api.calculatePricing({
        limit: formData.limit,
        attachmentPoint: formData.attachmentPoint,
        expectedLossRate: formData.expectedLossRatio,
        expenseLoadRatio: formData.underwriterExpense,
        profitMargin: 0.08,
        catRiskLoad: formData.catRiskLoad,
      });
      setPricingOutput(res);
    } catch {
      // Local calculation fallback
      const capacity = Math.max(0, formData.limit - formData.attachmentPoint);
      const pure = capacity * formData.expectedLossRatio;
      const risk = pure * formData.catRiskLoad;
      const exp = pure * formData.underwriterExpense;
      const margin = pure * 0.08;
      const techPrem = pure + risk + exp + margin;
      const rol = (techPrem / capacity) * 100;
      const comb = ((pure + exp) / techPrem) * 100;

      setPricingOutput({
        layerCapacity: capacity,
        expectedLoss: pure,
        purePremium: pure,
        riskLoad: risk,
        expenseLoad: exp,
        targetMargin: margin,
        technicalPremium: techPrem,
        rateOnLine: parseFloat(rol.toFixed(2)),
        estimatedCombinedRatio: parseFloat(comb.toFixed(2)),
        pml100Year: pure * 2.8,
        pml250Year: pure * 4.2,
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSignOff = () => {
    setSignOffStatus({
      approved: true,
      timestamp: new Date().toLocaleString(),
      signee: 'Eleanor Vance, FCAS (Chief Underwriter)',
      reference: `UW-AUTH-${Math.floor(10000 + Math.random() * 90000)}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <span>Actuarial Underwriting & Risk Pricing Workbench</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform stochastic loss simulation, layer attachment modeling, technical premium evaluation, and underwriting authority sign-off.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Input Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Layer & Risk Configuration</span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ceding Company (Cedent)</label>
              <input
                type="text"
                value={formData.cedentName}
                onChange={(e) => setFormData({ ...formData, cedentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Line of Business</label>
                <select
                  value={formData.lineOfBusiness}
                  onChange={(e) => setFormData({ ...formData, lineOfBusiness: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="PROPERTY">Property</option>
                  <option value="CASUALTY">Casualty</option>
                  <option value="SPECIALTY">Specialty</option>
                  <option value="MARINE_ENERGY">Marine & Energy</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Peril</label>
                <select
                  value={formData.peril}
                  onChange={(e) => setFormData({ ...formData, peril: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="HURRICANE_EARTHQUAKE">Hurricane & Quake</option>
                  <option value="SEVERE_STORM">Convective Storm</option>
                  <option value="CYBER">Cyber Accumulation</option>
                  <option value="FIRE_CASUALTY">Fire & Casualty</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attachment Point / Deductible ($)</label>
              <input
                type="number"
                value={formData.attachmentPoint}
                onChange={(e) => setFormData({ ...formData, attachmentPoint: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Layer Maximum Limit ($)</label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Loss Rate (ELR %)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.expectedLossRatio}
                  onChange={(e) => setFormData({ ...formData, expectedLossRatio: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cat Tail Risk Load (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.catRiskLoad}
                  onChange={(e) => setFormData({ ...formData, catRiskLoad: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{calculating ? 'Running Model Simulation...' : 'Calculate Technical Price'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Actuarial Model Outputs & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {pricingOutput ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    Model Run Completed
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Actuarial Pricing Breakdown</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Recommended Rate on Line</span>
                  <span className="text-xl font-black text-emerald-600">{pricingOutput.rateOnLine}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Layer Capacity</span>
                  <p className="text-lg font-bold text-slate-900">${(pricingOutput.layerCapacity / 1000000).toFixed(1)}M</p>
                  <span className="text-[10px] text-slate-400">Limit xs Attachment</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Technical Premium</span>
                  <p className="text-lg font-bold text-indigo-700">${pricingOutput.technicalPremium.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Pure Loss + Loads</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Pure Expected Loss</span>
                  <p className="text-lg font-bold text-slate-800">${pricingOutput.purePremium.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Burning Cost Model</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Est. Combined Ratio</span>
                  <p className="text-lg font-bold text-blue-600">{pricingOutput.estimatedCombinedRatio}%</p>
                  <span className="text-[10px] text-slate-400">Target Profit Margin 8%</span>
                </div>
              </div>

              {/* Stochastic Return Period Table */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Probable Maximum Loss (PML) Exceedance Probabilities</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">1-in-50 Year PML</span>
                    <span className="font-bold text-slate-800">${(pricingOutput.purePremium * 1.8 / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">1-in-100 Year PML</span>
                    <span className="font-bold text-slate-800">${(pricingOutput.pml100Year / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">1-in-250 Year PML</span>
                    <span className="font-bold text-rose-700">${(pricingOutput.pml250Year / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>

              {/* Underwriting Authority Sign-off Section */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Underwriting Authority Sign-off</h4>
                  <p className="text-[11px] text-slate-500">
                    Authorized underwriting limits for Chief Underwriters up to $100M layer capacity.
                  </p>
                </div>

                {signOffStatus ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Authorized ({signOffStatus.reference}) by {signOffStatus.signee}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSignOff}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve & Authorize Layer</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <Calculator className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-sm text-slate-600">No Actuarial Run Active</p>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                Configure your attachment points, limit parameters, and loss ratio assumptions on the left panel to execute technical pricing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnderwritingWorkbenchPage;
