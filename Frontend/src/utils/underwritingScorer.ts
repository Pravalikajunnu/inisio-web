import { DetailedRiskProfileData } from '../components/DetailedRiskProfileForm';

export interface ComprehensiveRiskRating {
  scoreOutOf10: number; // e.g. 8.4
  ratingLabel: string; // "Excellent (Low Risk)", "Good (Moderate Risk)", etc.
  badgeColor: string; // CSS classes for badges
  summaryText: string;
}

export function calculateComprehensiveRiskScore(
  riskData: DetailedRiskProfileData | null,
  baseFeasibilityScore: number = 75
): ComprehensiveRiskRating {
  if (!riskData) {
    const defaultScore = parseFloat(((baseFeasibilityScore / 100) * 10).toFixed(1));
    return getRatingObject(defaultScore);
  }

  // Base feasibility score contributes up to 3.5 points (35%)
  let totalPoints = (baseFeasibilityScore / 100) * 3.5;

  // 1. Industry Experience (Max 1.0 pt)
  switch (riskData.industryExperience) {
    case '10+ Years':
      totalPoints += 1.0;
      break;
    case '6–10 Years':
      totalPoints += 0.8;
      break;
    case '3–5 Years':
      totalPoints += 0.5;
      break;
    case '0–2 Years':
      totalPoints += 0.2;
      break;
    default:
      totalPoints += 0.4;
  }

  // 2. Educational Background (Max 0.8 pt)
  switch (riskData.educationalBackground) {
    case 'Technical / Professional Degree':
    case 'Post Graduate':
      totalPoints += 0.8;
      break;
    case 'Graduate':
      totalPoints += 0.6;
      break;
    case 'Diploma':
      totalPoints += 0.4;
      break;
    default:
      totalPoints += 0.3;
  }

  // 3. Business Vintage & Constitution (Max 1.0 pt)
  switch (riskData.businessVintage) {
    case '8+ Years':
      totalPoints += 0.5;
      break;
    case '4–7 Years':
      totalPoints += 0.4;
      break;
    case '1–3 Years':
      totalPoints += 0.25;
      break;
    default:
      totalPoints += 0.1;
  }

  if (riskData.businessConstitution === 'Private Limited' || riskData.businessConstitution === 'Public Limited') {
    totalPoints += 0.5;
  } else if (riskData.businessConstitution === 'LLP') {
    totalPoints += 0.4;
  } else {
    totalPoints += 0.2;
  }

  // 4. Financial Profile: Collateral Coverage (Max 1.2 pts)
  const colVal = parseFloat(riskData.collateralCoveragePct || '0');
  if (colVal >= 100) {
    totalPoints += 1.2;
  } else if (colVal >= 50) {
    totalPoints += 0.8;
  } else {
    totalPoints += 0.3;
  }

  // 5. Promoter Contribution Type (Max 0.5 pt)
  if (riskData.contributionType === 'Cash' || riskData.contributionType === 'Land') {
    totalPoints += 0.5;
  } else {
    totalPoints += 0.3;
  }

  // 6. Management & Technical Workforce (Max 0.5 pt)
  const mgmtNum = parseInt(riskData.managementTeamSize || '0', 10);
  const techNum = parseInt(riskData.technicalWorkforceCount || '0', 10);
  if (mgmtNum >= 4 && techNum >= 5) {
    totalPoints += 0.5;
  } else if (mgmtNum >= 2 || techNum >= 2) {
    totalPoints += 0.3;
  } else {
    totalPoints += 0.15;
  }

  // 7. Credit Profile / CIBIL Score (Max 1.5 pts)
  if (riskData.isNewToCredit) {
    totalPoints += 0.8; // Neutral score for start-ups
  } else {
    const cib = parseInt(riskData.cibilScore || '0', 10);
    if (cib >= 750) {
      totalPoints += 1.5;
    } else if (cib >= 700) {
      totalPoints += 1.1;
    } else if (cib >= 650) {
      totalPoints += 0.6;
    } else if (cib > 0) {
      totalPoints += 0.2;
    } else {
      totalPoints += 0.6;
    }
  }

  const finalScore = Math.min(10.0, Math.max(1.0, parseFloat(totalPoints.toFixed(1))));
  return getRatingObject(finalScore);
}

function getRatingObject(score: number): ComprehensiveRiskRating {
  if (score >= 8.5) {
    return {
      scoreOutOf10: score,
      ratingLabel: 'Excellent (Low Risk)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700',
      summaryText: 'Bankable greenfield profile with strong promoter track record, high collateral, and excellent creditworthiness.'
    };
  }
  if (score >= 7.0) {
    return {
      scoreOutOf10: score,
      ratingLabel: 'Good (Moderate Risk)',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700',
      summaryText: 'Favorable credit profile meeting standard institutional debt syndication norms.'
    };
  }
  if (score >= 5.5) {
    return {
      scoreOutOf10: score,
      ratingLabel: 'Average (Acceptable Risk)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
      summaryText: 'Acceptable underwriting score; enhancing collateral coverage or equity contribution is recommended.'
    };
  }
  return {
    scoreOutOf10: score,
    ratingLabel: 'High Risk / Needs Enhancement',
    badgeColor: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-700',
    summaryText: 'High risk parameters detected. Higher equity commitment or additional secondary collateral required.'
  };
}
