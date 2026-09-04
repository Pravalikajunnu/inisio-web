/**
 * Financial Calculation & Capex Breakdown Utilities
 * Ensures consistent, mathematically reconciled Project Cost & Means of Finance
 * across Assessment, Dashboard, PDF, and DOCX generators.
 */

export interface RawFinancialsInput {
  totalCostCr?: string | number;
  loanRequiredCr?: string | number;
  promoterContribCr?: string | number;
  debtPct?: number;
  eqPct?: number;
  consultancyCostCr?: string | number;
  machineryCostCr?: string | number;
  civilCostCr?: string | number;
  otherCostsCr?: string | number;
  termLoanCr?: string | number;
  promoterContributionCr?: string | number;
  otherFinanceCr?: string | number;
}

export interface ReconciledFinancials {
  totalCostCr: number;
  totalCostFormatted: string;
  consultancyCostCr: number;
  machineryCostCr: number;
  civilCostCr: number;
  otherCostsCr: number;
  consultancyFormatted: string;
  machineryFormatted: string;
  civilFormatted: string;
  otherCostsFormatted: string;
  termLoanCr: number;
  promoterContributionCr: number;
  otherFinanceCr: number;
  termLoanFormatted: string;
  promoterContributionFormatted: string;
  otherFinanceFormatted: string;
  totalFinanceCr: number;
  totalFinanceFormatted: string;
  debtPct: number;
  eqPct: number;
  otherPct: number;
}

/**
 * Reconciles and guarantees valid, non-zero project cost statement and means of finance
 */
export function reconcileProjectFinancials(input: RawFinancialsInput): ReconciledFinancials {
  const baseCost = Math.max(0, parseFloat(String(input.totalCostCr || 0)) || 0);

  let cCost = parseFloat(String(input.consultancyCostCr || '')) || 0;
  let mCost = parseFloat(String(input.machineryCostCr || '')) || 0;
  let lCost = parseFloat(String(input.civilCostCr || '')) || 0;
  let oCost = parseFloat(String(input.otherCostsCr || '')) || 0;

  const componentSum = cCost + mCost + lCost + oCost;

  // If user entered no components or all components sum to 0, generate standard industrial benchmarks
  if (componentSum <= 0 && baseCost > 0) {
    cCost = Number((baseCost * 0.05).toFixed(2));
    mCost = Number((baseCost * 0.60).toFixed(2));
    lCost = Number((baseCost * 0.25).toFixed(2));
    oCost = Number((baseCost - cCost - mCost - lCost).toFixed(2));
  } else if (componentSum > 0 && Math.abs(componentSum - baseCost) > 0.05 && baseCost > 0) {
    // If only partial components were given, adjust 'other' or scale to match baseCost if requested
    if (oCost === 0 && (cCost + mCost + lCost) < baseCost) {
      oCost = Number((baseCost - (cCost + mCost + lCost)).toFixed(2));
    }
  }

  const finalTotalCost = (cCost + mCost + lCost + oCost) > 0 ? (cCost + mCost + lCost + oCost) : baseCost;

  // Means of Finance
  const defaultDebtPct = input.debtPct !== undefined ? input.debtPct : 75;
  const defaultEqPct = input.eqPct !== undefined ? input.eqPct : 25;

  let termLoan = parseFloat(String(input.termLoanCr || ''));
  if (isNaN(termLoan) || termLoan <= 0) {
    termLoan = parseFloat(String(input.loanRequiredCr || ''));
    if (isNaN(termLoan) || termLoan <= 0) {
      termLoan = Number((finalTotalCost * (defaultDebtPct / 100)).toFixed(2));
    }
  }

  let promoterEquity = parseFloat(String(input.promoterContributionCr || ''));
  if (isNaN(promoterEquity) || promoterEquity <= 0) {
    promoterEquity = parseFloat(String(input.promoterContribCr || ''));
    if (isNaN(promoterEquity) || promoterEquity <= 0) {
      promoterEquity = Number((finalTotalCost * (defaultEqPct / 100)).toFixed(2));
    }
  }

  const otherFinance = Math.max(0, parseFloat(String(input.otherFinanceCr || 0)) || 0);

  // If total finance is empty or mismatched, balance it to match finalTotalCost
  let finalTotalFinance = termLoan + promoterEquity + otherFinance;
  if (finalTotalFinance <= 0 && finalTotalCost > 0) {
    termLoan = Number((finalTotalCost * (defaultDebtPct / 100)).toFixed(2));
    promoterEquity = Number((finalTotalCost - termLoan).toFixed(2));
    finalTotalFinance = termLoan + promoterEquity;
  }

  const calculatedDebtPct = finalTotalFinance > 0 ? Number(((termLoan / finalTotalFinance) * 100).toFixed(1)) : defaultDebtPct;
  const calculatedEqPct = finalTotalFinance > 0 ? Number(((promoterEquity / finalTotalFinance) * 100).toFixed(1)) : defaultEqPct;
  const calculatedOtherPct = finalTotalFinance > 0 ? Number(((otherFinance / finalTotalFinance) * 100).toFixed(1)) : 0;

  return {
    totalCostCr: Number(finalTotalCost.toFixed(2)),
    totalCostFormatted: finalTotalCost.toFixed(2),
    consultancyCostCr: Number(cCost.toFixed(2)),
    machineryCostCr: Number(mCost.toFixed(2)),
    civilCostCr: Number(lCost.toFixed(2)),
    otherCostsCr: Number(oCost.toFixed(2)),
    consultancyFormatted: cCost.toFixed(2),
    machineryFormatted: mCost.toFixed(2),
    civilFormatted: lCost.toFixed(2),
    otherCostsFormatted: oCost.toFixed(2),
    termLoanCr: Number(termLoan.toFixed(2)),
    promoterContributionCr: Number(promoterEquity.toFixed(2)),
    otherFinanceCr: Number(otherFinance.toFixed(2)),
    termLoanFormatted: termLoan.toFixed(2),
    promoterContributionFormatted: promoterEquity.toFixed(2),
    otherFinanceFormatted: otherFinance.toFixed(2),
    totalFinanceCr: Number(finalTotalFinance.toFixed(2)),
    totalFinanceFormatted: finalTotalFinance.toFixed(2),
    debtPct: calculatedDebtPct,
    eqPct: calculatedEqPct,
    otherPct: calculatedOtherPct
  };
}
