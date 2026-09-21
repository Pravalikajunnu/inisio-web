import { CASubscription } from '../types';

const CA_STORAGE_KEY_PREFIX = 'inisio_ca_subscription_';

export function getCASubscription(email: string, name: string = 'Chartered Accountant'): CASubscription {
  const normalizedEmail = email.trim().toLowerCase();
  const key = `${CA_STORAGE_KEY_PREFIX}${normalizedEmail}`;
  const stored = localStorage.getItem(key);

  const todayStr = new Date().toISOString().slice(0, 10);

  if (stored) {
    try {
      const parsed: CASubscription = JSON.parse(stored);
      
      // Check if daily counter needs to be reset for today
      if (parsed.lastAssessmentDate !== todayStr) {
        parsed.dailyAssessmentsUsed = 0;
        parsed.lastAssessmentDate = todayStr;
      }

      // Check if trial has expired and not paid
      const nowTime = new Date().getTime();
      const trialEndTime = new Date(parsed.trialEndDate).getTime();

      if (!parsed.isPaidActive && nowTime > trialEndTime) {
        parsed.plan = 'EXPIRED_TRIAL';
      }

      localStorage.setItem(key, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      console.error('Error parsing CA subscription, recreating default:', e);
    }
  }

  // Create new 3-Month Trial subscription for this CA
  const now = new Date();
  const trialEnd = new Date();
  trialEnd.setMonth(trialEnd.getMonth() + 3); // 3 months free trial

  const defaultSub: CASubscription = {
    caEmail: normalizedEmail,
    caName: name,
    plan: '3_MONTH_TRIAL',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    isPaidActive: false,
    pricePerAnnum: 2500,
    dailyAssessmentsUsed: 0,
    lastAssessmentDate: todayStr,
    maxDailyAssessmentsFree: 2
  };

  localStorage.setItem(key, JSON.stringify(defaultSub));
  return defaultSub;
}

export function canPerformCAAssessment(email: string): { allowed: boolean; reason?: string; remainingToday?: number; requiresUpgrade?: boolean } {
  const sub = getCASubscription(email);
  const todayStr = new Date().toISOString().slice(0, 10);

  // If paid active annual membership (₹2,500/yr), unlimited assessments
  if (sub.isPaidActive) {
    return { allowed: true };
  }

  // If active 3-month trial
  const nowTime = new Date().getTime();
  const trialEndTime = new Date(sub.trialEndDate).getTime();

  if (nowTime <= trialEndTime) {
    return { allowed: true };
  }

  // If trial expired, rate limit to max 2 assessments per day
  const used = sub.lastAssessmentDate === todayStr ? sub.dailyAssessmentsUsed : 0;
  const maxLimit = sub.maxDailyAssessmentsFree || 2;

  if (used < maxLimit) {
    return {
      allowed: true,
      remainingToday: maxLimit - used
    };
  }

  return {
    allowed: false,
    requiresUpgrade: true,
    reason: `Daily limit of ${maxLimit} project assessments reached for free trial tier. Upgrade to Inisio CA Pro Annual Tier (₹2,500/year) for unlimited assessments.`
  };
}

export function recordCAAssessment(email: string): { success: boolean; usage: number; limitReached: boolean } {
  const sub = getCASubscription(email);
  const todayStr = new Date().toISOString().slice(0, 10);

  if (sub.lastAssessmentDate !== todayStr) {
    sub.dailyAssessmentsUsed = 1;
    sub.lastAssessmentDate = todayStr;
  } else {
    sub.dailyAssessmentsUsed += 1;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const key = `${CA_STORAGE_KEY_PREFIX}${normalizedEmail}`;
  localStorage.setItem(key, JSON.stringify(sub));

  const limitReached = !sub.isPaidActive && sub.dailyAssessmentsUsed >= (sub.maxDailyAssessmentsFree || 2);

  // Dispatch custom event for real-time reactivity in UI
  window.dispatchEvent(new CustomEvent('inisio_ca_subscription_updated', { detail: sub }));

  return {
    success: true,
    usage: sub.dailyAssessmentsUsed,
    limitReached
  };
}

export function upgradeCASubscription(email: string): CASubscription {
  const sub = getCASubscription(email);
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  sub.plan = 'ANNUAL_PRO';
  sub.isPaidActive = true;
  sub.subscriptionEndDate = oneYearLater.toISOString();

  const normalizedEmail = email.trim().toLowerCase();
  const key = `${CA_STORAGE_KEY_PREFIX}${normalizedEmail}`;
  localStorage.setItem(key, JSON.stringify(sub));

  window.dispatchEvent(new CustomEvent('inisio_ca_subscription_updated', { detail: sub }));
  return sub;
}
