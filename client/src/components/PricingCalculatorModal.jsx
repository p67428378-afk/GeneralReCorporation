import { useState } from 'react';
import { X, Calculator, Sparkles, TrendingUp, ShieldAlert, Check } from 'lucide-react';
import { api } from '../services/api';

export const PricingCalculatorModal = ({ isOpen, onClose, onApplyToTreaty }) => {
  const [params, setParams] = useState({
    limit: 50000000,
    attachmentPoint: 10000000,
    expectedLossRate: 0.042,
    expenseLoadRatio: 0.12,
    profitMargin: 0.08,
    catRiskLoad: 0.05,
    reinstatementCount: 1,
  });

  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  if (!isOpen) return null;

  const handleCompute = async () => {
    setCalculating(true);
    try {
      const res = await api.calculatePricing(params);
      setResult(res);
    } catch {
      // Local fallback
      const layerCapacity = Math.max(0, params.limit - params.attachmentPoint);
      const purePremium = layerCapacity * params.expectedLossRate;
      const riskLoad = purePremium * params.catRiskLoad;
      const expenseLoad = purePremium * params.expenseLoadRatio;
      const targetMargin = purePremium * params.profitMargin;
      const technicalPremium = purePremium + riskLoad + expenseLoad + targetMargin;
      const rateOnLine = (technicalPremium / layerCapacity) * 100;
      const estimatedCombinedRatio = ((purePremium + expenseLoad) / technicalPremium) * 100;

      setResult({
        layerCapacity,
        expectedLoss: purePremium,
        purePremium,
        riskLoad,
        expenseLoad,
        targetMargin,
        technicalPremium,
        rateOnLine: parseFloat(rateOnLine.toFixed(2)),
        estimatedCombinedRatio: parseFloat(estimatedCombinedRatio.toFixed(2)),
        pml100Year: purePremium * 2.8,
        pml250Year: purePremium * 4.2,
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Actuarial Risk Pricing & Rate-on-Line Engine</h3>
              <p className="text-xs text-slate-500">Model technical premium, attachment dynamics, and expected combined ratio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Layer Upper Limit ($)</label>
            <input
              type="number"
              value={params.limit}
              onChange={(e) => setParams({ ...params, limit: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment Point / Retention ($)</label>
            <input
              type="number"
              value={params.attachmentPoint}
              onChange={(e) => setParams({ ...params, attachmentPoint: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Loss Cost (ELR %)</label>
            <input
              type="number"
              step="0.001"
              value={params.expectedLossRate}
              onChange={(e) => setParams({ ...params, expectedLossRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catastrophe / Tail Risk Load (%)</label>
            <input
              type="number"
              step="0.01"
              value={params.catRiskLoad}
              onChange={(e) => setParams({ ...params, catRiskLoad: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriting Expense Load (%)</label>
            <input
              type="number"
              step="0.01"
              value={params.expenseLoadRatio}
              onChange={(e) => setParams({ ...params, expenseLoadRatio: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Underwriting Margin (%)</label>
            <input
              type="number"
              step="0.01"
              value={params.profitMargin}
              onChange={(e) => setParams({ ...params, profitMargin: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleCompute}
            disabled={calculating}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{calculating ? 'Modeling...' : 'Compute Actuarial Price'}</span>
          </button>
        </div>

        {result && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Actuarial Pricing Output</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Layer Capacity</span>
                <p className="text-base font-bold text-slate-900">${(result.layerCapacity / 1000000).toFixed(1)}M</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Technical Premium</span>
                <p className="text-base font-bold text-indigo-600">${result.technicalPremium.toLocaleString()}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Rate on Line (RoL)</span>
                <p className="text-base font-bold text-emerald-600">{result.rateOnLine}%</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Est. Combined Ratio</span>
                <p className="text-base font-bold text-blue-600">{result.estimatedCombinedRatio}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> 1-in-100 Yr PML: ${(result.pml100Year / 1000000).toFixed(2)}M
              </span>
              <span>1-in-250 Yr PML: ${(result.pml250Year / 1000000).toFixed(2)}M</span>
            </div>

            {onApplyToTreaty && (
              <button
                onClick={() => {
                  onApplyToTreaty(result);
                  onClose();
                }}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
              >
                <Check className="w-4 h-4" />
                <span>Apply Modeled Technical Premium to Treaty</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCalculatorModal;
