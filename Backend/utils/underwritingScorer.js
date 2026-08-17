/**
 * Inisio Financial Underwriting & Feasibility Evaluation Engine
 */

export function calculateUnderwritingMetrics(data) {
  const {
    industry = 'General Manufacturing',
    projectCostCr = 10,
    equityPercent = 25,
    landStatus = 'identified',
    collateralStatus = '',
    promoterExpYears = 5,
    locationState = 'Telangana',
    dprReady = false,
    targetBankType = 'PSU',
  } = data;

  const cost = Math.max(0.5, Number(projectCostCr) || 10);
  const eqPct = Math.min(60, Math.max(10, Number(equityPercent) || 25));
  const exp = Math.max(0, Number(promoterExpYears) || 0);

  // Baseline feasibility score
  let score = 55;

  // 1. Equity Contribution Weight (up to +18 points)
  if (eqPct >= 35) score += 18;
  else if (eqPct >= 30) score += 14;
  else if (eqPct >= 25) score += 10;
  else if (eqPct >= 20) score += 5;
  else score -= 5;

  // 2. Land Possession Status Weight (up to +12 points)
  if (landStatus === 'owned') score += 12;
  else if (landStatus === 'leased') score += 8;
  else if (landStatus === 'identified') score += 4;
  else score -= 8;

  // 3. Promoter Track Record (up to +12 points)
  if (exp >= 10) score += 12;
  else if (exp >= 5) score += 8;
  else if (exp >= 2) score += 4;
  else score += 1;

  // 4. DPR Preparedness (up to +8 points)
  if (dprReady) score += 8;
  else score -= 2;

  // Cap score between 40 and 96
  score = Math.min(96, Math.max(42, Math.round(score)));

  // Determine Bankability Grade
  let bankabilityGrade = 'B';
  if (score >= 88) bankabilityGrade = 'A+';
  else if (score >= 78) bankabilityGrade = 'A';
  else if (score >= 68) bankabilityGrade = 'B+';
  else if (score >= 55) bankabilityGrade = 'B';
  else bankabilityGrade = 'C';

  // Calculate Debt Component
  const debtPct = 100 - eqPct;
  const maxLoanAmountCr = Number(((cost * debtPct) / 100).toFixed(2));

  // Estimated Interest Rate
  let estInterestRate = '9.25% - 10.50%';
  if (bankabilityGrade === 'A+') estInterestRate = '8.40% - 9.15%';
  else if (bankabilityGrade === 'A') estInterestRate = '8.90% - 9.60%';
  else if (bankabilityGrade === 'B+') estInterestRate = '9.50% - 10.80%';
  else if (bankabilityGrade === 'B') estInterestRate = '10.50% - 12.00%';
  else estInterestRate = '12.00% - 14.50%';

  // DSCR calculation estimate
  let dscrEstimate = 1.45;
  if (bankabilityGrade === 'A+') dscrEstimate = 1.85;
  else if (bankabilityGrade === 'A') dscrEstimate = 1.62;
  else if (bankabilityGrade === 'B+') dscrEstimate = 1.40;
  else if (bankabilityGrade === 'B') dscrEstimate = 1.25;
  else dscrEstimate = 1.10;

  // Payback period
  let paybackYears = 4.5;
  if (bankabilityGrade === 'A+') paybackYears = 3.5;
  else if (bankabilityGrade === 'A') paybackYears = 4.2;
  else if (bankabilityGrade === 'B+') paybackYears = 5.0;
  else paybackYears = 6.2;

  // Strength points
  const strengthPoints = [];
  if (eqPct >= 25) strengthPoints.push(`Healthy promoter equity margin of ${eqPct}% reduces bank leverage risk.`);
  if (landStatus === 'owned' || landStatus === 'leased') strengthPoints.push(`Land status is secure (${landStatus}), expediting SARFAESI & title search clearances.`);
  if (exp >= 5) strengthPoints.push(`Strong promoter execution background with ${exp}+ years in relevant sector.`);
  if (dprReady) strengthPoints.push(`Detailed Project Report (DPR) is ready with vetted techno-economic viability.`);
  if (score >= 80) strengthPoints.push(`Project falls into Priority Sector / High-growth industrial category with low NPA default rates.`);

  // Key Risks & Mitigants
  const keyRisks = [];
  if (eqPct < 25) keyRisks.push(`Low promoter equity (<25%) may require additional collateral / CGTMSE cover.`);
  if (landStatus === 'not_started' || landStatus === 'identified') keyRisks.push(`Land acquisition and pollution/zoning clearances pending.`);
  if (cost > 25 && targetBankType === 'NBFC') keyRisks.push(`High project cost (₹${cost} Cr) is better suited for PSU / Consortium banking to optimize interest costs.`);
  if (!dprReady) keyRisks.push(`Detailed Techno-Economic Feasibility Report (TEFR) must be finalized before formal loan appraisal.`);

  return {
    feasibilityScore: score,
    bankabilityGrade,
    maxLoanAmountCr,
    estInterestRate,
    dscrEstimate,
    paybackYears,
    strengthPoints,
    keyRisks,
  };
}

export default {
  calculateUnderwritingMetrics,
};
