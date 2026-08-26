import React, { useState, useEffect } from 'react';
import { CustomCostComponent, CustomFinanceComponent } from '../../types';
import {
  Coins,
  Calculator,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  TrendingUp,
  Landmark,
  Building,
  Sparkles,
  PieChart
} from 'lucide-react';

export type CurrencyUnit = 'Cr' | 'Lakhs' | 'Millions';

interface ProjectFinancialsBreakupProps {
  totalCostCr: number;
  loanRequiredCr: number;
  promoterContribCr: number;
  customCosts?: CustomCostComponent[];
  customFinances?: CustomFinanceComponent[];
  onSaveFinancials: (
    updatedCosts: CustomCostComponent[],
    updatedFinances: CustomFinanceComponent[],
    calculatedTotalCostCr: number,
    calculatedDebtCr: number,
    calculatedEquityCr: number
  ) => void;
  onOpenEditModal: () => void;
}

export const ProjectFinancialsBreakup: React.FC<ProjectFinancialsBreakupProps> = ({
  totalCostCr,
  loanRequiredCr,
  promoterContribCr,
  customCosts = [],
  customFinances = [],
  onSaveFinancials,
  onOpenEditModal
}) => {
  const [unit, setUnit] = useState<CurrencyUnit>('Cr');

  // Convert Crores to display unit
  const formatAmount = (crVal: number) => {
    if (unit === 'Lakhs') {
      return (crVal * 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
    if (unit === 'Millions') {
      // 1 Cr = 10 Million
      return (crVal * 10).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
    return crVal.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const getUnitSymbol = () => {
    if (unit === 'Lakhs') return '₹ Lakhs';
    if (unit === 'Millions') return '₹ Millions';
    return '₹ Cr';
  };

  // Default base breakdown if custom arrays are empty
  const activeCosts: CustomCostComponent[] = customCosts && customCosts.length > 0 ? customCosts : [
    { id: 'c-1', title: 'Plant & Heavy Machinery', amountCr: Math.round(totalCostCr * 0.60 * 100) / 100, category: 'Machinery' },
    { id: 'c-2', title: 'Civil Works & Factory Building', amountCr: Math.round(totalCostCr * 0.25 * 100) / 100, category: 'Civil' },
    { id: 'c-3', title: 'Engineering, Utilities & Power', amountCr: Math.round(totalCostCr * 0.08 * 100) / 100, category: 'Technology' },
    { id: 'c-4', title: 'Consultancy & Pre-operative Expenses', amountCr: Math.round(totalCostCr * 0.04 * 100) / 100, category: 'Consultancy' },
    { id: 'c-5', title: 'Margin for Working Capital', amountCr: Math.round(totalCostCr * 0.03 * 100) / 100, category: 'Working Capital' }
  ];

  const activeFinances: CustomFinanceComponent[] = customFinances && customFinances.length > 0 ? customFinances : [
    { id: 'f-1', title: 'Institutional Term Debt / Bank Loan', amountCr: loanRequiredCr || (Math.round(totalCostCr * 0.70 * 100) / 100), type: 'Term Debt' },
    { id: 'f-2', title: 'Promoter Equity Contribution', amountCr: promoterContribCr || (Math.round(totalCostCr * 0.30 * 100) / 100), type: 'Promoter Equity' }
  ];

  const [costs, setCosts] = useState<CustomCostComponent[]>(() => activeCosts);
  const [finances, setFinances] = useState<CustomFinanceComponent[]>(() => activeFinances);

  const prevCostsRef = React.useRef<string>(JSON.stringify(customCosts || []));
  const prevFinancesRef = React.useRef<string>(JSON.stringify(customFinances || []));

  useEffect(() => {
    const currentCostsJson = JSON.stringify(customCosts || []);
    if (customCosts && customCosts.length > 0) {
      if (currentCostsJson !== prevCostsRef.current) {
        prevCostsRef.current = currentCostsJson;
        setCosts(customCosts);
      }
    } else if (prevCostsRef.current !== '') {
      prevCostsRef.current = '';
      setCosts([
        { id: 'c-1', title: 'Plant & Heavy Machinery', amountCr: Math.round(totalCostCr * 0.60 * 100) / 100, category: 'Machinery' },
        { id: 'c-2', title: 'Civil Works & Factory Building', amountCr: Math.round(totalCostCr * 0.25 * 100) / 100, category: 'Civil' },
        { id: 'c-3', title: 'Engineering, Utilities & Power', amountCr: Math.round(totalCostCr * 0.08 * 100) / 100, category: 'Technology' },
        { id: 'c-4', title: 'Consultancy & Pre-operative Expenses', amountCr: Math.round(totalCostCr * 0.04 * 100) / 100, category: 'Consultancy' },
        { id: 'c-5', title: 'Margin for Working Capital', amountCr: Math.round(totalCostCr * 0.03 * 100) / 100, category: 'Working Capital' }
      ]);
    }
  }, [customCosts, totalCostCr]);

  useEffect(() => {
    const currentFinancesJson = JSON.stringify(customFinances || []);
    if (customFinances && customFinances.length > 0) {
      if (currentFinancesJson !== prevFinancesRef.current) {
        prevFinancesRef.current = currentFinancesJson;
        setFinances(customFinances);
      }
    } else if (prevFinancesRef.current !== '') {
      prevFinancesRef.current = '';
      setFinances([
        { id: 'f-1', title: 'Institutional Term Debt / Bank Loan', amountCr: loanRequiredCr || (Math.round(totalCostCr * 0.70 * 100) / 100), type: 'Term Debt' },
        { id: 'f-2', title: 'Promoter Equity Contribution', amountCr: promoterContribCr || (Math.round(totalCostCr * 0.30 * 100) / 100), type: 'Promoter Equity' }
      ]);
    }
  }, [customFinances, loanRequiredCr, promoterContribCr, totalCostCr]);

  // Modal / Inputs state for adding custom component
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [newCostTitle, setNewCostTitle] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');
  const [newCostCategory, setNewCostCategory] = useState<CustomCostComponent['category']>('Other');

  const [isAddingFinance, setIsAddingFinance] = useState(false);
  const [newFinanceTitle, setNewFinanceTitle] = useState('');
  const [newFinanceAmount, setNewFinanceAmount] = useState('');
  const [newFinanceType, setNewFinanceType] = useState<CustomFinanceComponent['type']>('Other');

  // Calculations
  const computedTotalCost = costs.reduce((sum, c) => sum + (Number(c.amountCr) || 0), 0);
  const computedTotalFinance = finances.reduce((sum, f) => sum + (Number(f.amountCr) || 0), 0);
  
  const termDebtItem = finances.find(f => f.type === 'Term Debt');
  const computedDebt = termDebtItem ? Number(termDebtItem.amountCr) : Math.round(computedTotalFinance * 0.70 * 100) / 100;
  const computedEquity = computedTotalFinance - computedDebt;

  const debtPct = computedTotalFinance > 0 ? (computedDebt / computedTotalFinance) * 100 : 70;
  const equityPct = computedTotalFinance > 0 ? 100 - debtPct : 30;

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCostTitle.trim() || !newCostAmount) return;

    let amtInCr = parseFloat(newCostAmount);
    if (unit === 'Lakhs') amtInCr = amtInCr / 100;
    if (unit === 'Millions') amtInCr = amtInCr / 10;

    const newItem: CustomCostComponent = {
      id: `cost-${Date.now()}`,
      title: newCostTitle,
      amountCr: Math.round(amtInCr * 100) / 100,
      category: newCostCategory
    };

    const updated = [...costs, newItem];
    setCosts(updated);
    setNewCostTitle('');
    setNewCostAmount('');
    setIsAddingCost(false);

    const newTotal = updated.reduce((sum, c) => sum + c.amountCr, 0);
    onSaveFinancials(updated, finances, newTotal, computedDebt, computedEquity);
  };

  const handleDeleteCost = (id: string) => {
    const updated = costs.filter(c => c.id !== id);
    setCosts(updated);
    const newTotal = updated.reduce((sum, c) => sum + c.amountCr, 0);
    onSaveFinancials(updated, finances, newTotal, computedDebt, computedEquity);
  };

  const handleAddFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinanceTitle.trim() || !newFinanceAmount) return;

    let amtInCr = parseFloat(newFinanceAmount);
    if (unit === 'Lakhs') amtInCr = amtInCr / 100;
    if (unit === 'Millions') amtInCr = amtInCr / 10;

    const newItem: CustomFinanceComponent = {
      id: `finance-${Date.now()}`,
      title: newFinanceTitle,
      amountCr: Math.round(amtInCr * 100) / 100,
      type: newFinanceType
    };

    const updated = [...finances, newItem];
    setFinances(updated);
    setNewFinanceTitle('');
    setNewFinanceAmount('');
    setIsAddingFinance(false);

    const newTotalFin = updated.reduce((sum, f) => sum + f.amountCr, 0);
    const dItem = updated.find(f => f.type === 'Term Debt');
    const newDebt = dItem ? dItem.amountCr : Math.round(newTotalFin * 0.70 * 100) / 100;
    const newEquity = newTotalFin - newDebt;

    onSaveFinancials(costs, updated, computedTotalCost, newDebt, newEquity);
  };

  const handleDeleteFinance = (id: string) => {
    const updated = finances.filter(f => f.id !== id);
    setFinances(updated);
    const newTotalFin = updated.reduce((sum, f) => sum + f.amountCr, 0);
    const dItem = updated.find(f => f.type === 'Term Debt');
    const newDebt = dItem ? dItem.amountCr : Math.round(newTotalFin * 0.70 * 100) / 100;
    const newEquity = newTotalFin - newDebt;

    onSaveFinancials(costs, updated, computedTotalCost, newDebt, newEquity);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Header & Unit Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Project Cost &amp; Means of Finance Breakdown
            </h3>
            <p className="text-xs text-zinc-500">
              Customizable capital outlay and institutional funding structure.
            </p>
          </div>
        </div>

        {/* Currency Unit Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-semibold text-zinc-500 px-2 uppercase">Unit:</span>
          {(['Cr', 'Lakhs', 'Millions'] as CurrencyUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                unit === u
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ₹ {u}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout for Cost & Means of Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Project Cost (CAPEX) */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                1. Project Cost (CAPEX)
              </h4>
              <span className="text-[11px] text-zinc-500">Total Outlay: <strong>{getUnitSymbol()} {formatAmount(computedTotalCost)}</strong></span>
            </div>
            <button
              onClick={() => setIsAddingCost(true)}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-blue-200/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Component</span>
            </button>
          </div>

          <div className="space-y-2">
            {costs.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-zinc-200/80 flex items-center justify-between text-xs hover:border-zinc-300 transition-colors"
              >
                <div>
                  <div className="font-semibold text-zinc-800">{item.title}</div>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900 font-mono">
                    {getUnitSymbol()} {formatAmount(item.amountCr)}
                  </span>
                  {costs.length > 1 && (
                    <button
                      onClick={() => handleDeleteCost(item.id)}
                      className="p-1 text-zinc-300 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Cost inline form */}
          {isAddingCost && (
            <form onSubmit={handleAddCost} className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5 text-xs">
              <div className="font-bold text-blue-900">Add Custom Cost Component</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Component Title (e.g. Land Development)"
                  value={newCostTitle}
                  onChange={(e) => setNewCostTitle(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg outline-none text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={`Amount in ${getUnitSymbol()}`}
                  value={newCostAmount}
                  onChange={(e) => setNewCostAmount(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg outline-none text-xs"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <select
                  value={newCostCategory}
                  onChange={(e) => setNewCostCategory(e.target.value as any)}
                  className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-xs"
                >
                  <option value="Machinery">Machinery</option>
                  <option value="Civil">Civil</option>
                  <option value="Technology">Technology</option>
                  <option value="Consultancy">Consultancy</option>
                  <option value="Working Capital">Working Capital</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingCost(false)}
                    className="px-2.5 py-1 text-zinc-600 hover:text-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT: Means of Finance */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                2. Means of Finance
              </h4>
              <span className="text-[11px] text-zinc-500">Total Funded: <strong>{getUnitSymbol()} {formatAmount(computedTotalFinance)}</strong></span>
            </div>
            <button
              onClick={() => setIsAddingFinance(true)}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </button>
          </div>

          <div className="space-y-2">
            {finances.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-zinc-200/80 flex items-center justify-between text-xs hover:border-zinc-300 transition-colors"
              >
                <div>
                  <div className="font-semibold text-zinc-800">{item.title}</div>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase">{item.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900 font-mono">
                    {getUnitSymbol()} {formatAmount(item.amountCr)}
                  </span>
                  {finances.length > 1 && (
                    <button
                      onClick={() => handleDeleteFinance(item.id)}
                      className="p-1 text-zinc-300 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Finance inline form */}
          {isAddingFinance && (
            <form onSubmit={handleAddFinance} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5 text-xs">
              <div className="font-bold text-emerald-900">Add Means of Finance Source</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Funding Title (e.g. State Capital Subsidy)"
                  value={newFinanceTitle}
                  onChange={(e) => setNewFinanceTitle(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg outline-none text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={`Amount in ${getUnitSymbol()}`}
                  value={newFinanceAmount}
                  onChange={(e) => setNewFinanceAmount(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg outline-none text-xs"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <select
                  value={newFinanceType}
                  onChange={(e) => setNewFinanceType(e.target.value as any)}
                  className="px-2 py-1 bg-white border border-emerald-200 rounded-lg text-xs"
                >
                  <option value="Term Debt">Term Debt</option>
                  <option value="Promoter Equity">Promoter Equity</option>
                  <option value="Subsidy / Grant">Subsidy / Grant</option>
                  <option value="Unsecured Loan">Unsecured Loan</option>
                  <option value="Venture Debt">Venture Debt</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingFinance(false)}
                    className="px-2.5 py-1 text-zinc-600 hover:text-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Debt vs Equity Distribution Bar */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
          <span>Debt vs. Equity Gearing Ratio</span>
          <span className="font-mono text-zinc-600">{debtPct.toFixed(1)}% Debt : {equityPct.toFixed(1)}% Equity</span>
        </div>
        <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${debtPct}%` }}
            title={`Debt: ${debtPct.toFixed(1)}%`}
          />
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${equityPct}%` }}
            title={`Equity: ${equityPct.toFixed(1)}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Bank Term Loan: <strong>{getUnitSymbol()} {formatAmount(computedDebt)}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Promoter Equity: <strong>{getUnitSymbol()} {formatAmount(computedEquity)}</strong></span>
          </span>
        </div>
      </div>
    </div>
  );
};
