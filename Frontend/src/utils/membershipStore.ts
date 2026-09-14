/**
 * Inisio Membership & Subscription Pathway Store
 * Manages Free Starter (1 assessment), Pro Promoter, and Enterprise memberships.
 */

export type MembershipPlan = 'free' | 'pro' | 'enterprise';

export interface UserMembership {
  plan: MembershipPlan;
  isMember: boolean;
  activeSince?: string;
  expiresAt?: string;
  completedAssessmentCount: number;
}

const MEMBERSHIP_STORAGE_PREFIX = 'inisio_user_membership_';
const GLOBAL_GUEST_ASSESSMENT_COUNT_KEY = 'inisio_guest_completed_assessments';

export function getUserMembership(userEmail?: string): UserMembership {
  try {
    const emailKey = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    const saved = localStorage.getItem(MEMBERSHIP_STORAGE_PREFIX + emailKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        plan: parsed.plan || 'free',
        isMember: parsed.plan === 'pro' || parsed.plan === 'enterprise',
        activeSince: parsed.activeSince,
        expiresAt: parsed.expiresAt,
        completedAssessmentCount: Number(parsed.completedAssessmentCount || 0)
      };
    }

    // Default for guest / new user
    const guestCount = userEmail
      ? 0
      : parseInt(localStorage.getItem(GLOBAL_GUEST_ASSESSMENT_COUNT_KEY) || '0', 10);
    return {
      plan: 'free',
      isMember: false,
      completedAssessmentCount: guestCount
    };
  } catch (e) {
    console.error('Failed to get user membership:', e);
    return { plan: 'free', isMember: false, completedAssessmentCount: 0 };
  }
}

export function setUserMembership(plan: MembershipPlan, userEmail?: string): UserMembership {
  try {
    const emailKey = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    const current = getUserMembership(userEmail);
    const updated: UserMembership = {
      ...current,
      plan,
      isMember: plan === 'pro' || plan === 'enterprise',
      activeSince: current.activeSince || new Date().toISOString()
    };

    localStorage.setItem(MEMBERSHIP_STORAGE_PREFIX + emailKey, JSON.stringify(updated));

    // Also update in active user object if logged in
    const activeUserRaw = localStorage.getItem('inisio_active_user');
    if (activeUserRaw) {
      try {
        const activeUser = JSON.parse(activeUserRaw);
        activeUser.membershipPlan = plan;
        activeUser.isMember = plan === 'pro' || plan === 'enterprise';
        localStorage.setItem('inisio_active_user', JSON.stringify(activeUser));
      } catch (err) {
        // ignore
      }
    }

    window.dispatchEvent(new CustomEvent('inisio_membership_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Failed to set user membership:', e);
    return { plan, isMember: plan !== 'free', completedAssessmentCount: 0 };
  }
}

export function recordAssessmentCompletion(userEmail?: string): void {
  try {
    const emailKey = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    const current = getUserMembership(userEmail);
    const newCount = (current.completedAssessmentCount || 0) + 1;

    const updated: UserMembership = {
      ...current,
      completedAssessmentCount: newCount
    };

    localStorage.setItem(MEMBERSHIP_STORAGE_PREFIX + emailKey, JSON.stringify(updated));
    if (!userEmail) {
      localStorage.setItem(GLOBAL_GUEST_ASSESSMENT_COUNT_KEY, String(newCount));
    }
    
    window.dispatchEvent(new CustomEvent('inisio_membership_updated', { detail: updated }));
  } catch (e) {
    console.error('Failed to record assessment completion:', e);
  }
}

/**
 * Checks if user is eligible to start a new free assessment
 * Returns true if user is a Pro/Enterprise member OR has completed 0 free assessments
 */
export function canUserStartAssessment(userEmail?: string, userProjectCount: number = 0): {
  allowed: boolean;
  reason?: 'limit_reached' | 'membership_active';
  plan: MembershipPlan;
} {
  const membership = getUserMembership(userEmail);

  if (membership.isMember || membership.plan === 'pro' || membership.plan === 'enterprise') {
    return { allowed: true, reason: 'membership_active', plan: membership.plan };
  }

  // If user has already completed 1 assessment (either in membership store, guest store, or projects count)
  const totalCompleted = Math.max(membership.completedAssessmentCount, userProjectCount);
  if (totalCompleted >= 1) {
    return { allowed: false, reason: 'limit_reached', plan: 'free' };
  }

  return { allowed: true, plan: 'free' };
}
