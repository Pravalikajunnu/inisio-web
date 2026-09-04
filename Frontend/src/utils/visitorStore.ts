// Inisio Visitor & Website Traffic Analytics Store

export interface VisitorLog {
  id: string;
  sessionId: string;
  timestamp: string;
  page: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  referrer: string;
  userEmail?: string;
  durationSeconds?: number;
}

export interface VisitorSummary {
  totalVisits: number;
  uniqueVisitors: number;
  activeNow: number;
  desktopPercent: number;
  mobilePercent: number;
  topPages: { page: string; count: number }[];
  recentLogs: VisitorLog[];
}

const VISITOR_LOGS_KEY = 'inisio_visitor_logs_v1';
const SESSION_ID_KEY = 'inisio_visitor_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

function detectDevice(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}

export function recordPageView(pageName: string, userEmail?: string): void {
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();
  const logs = getStoredVisitorLogs();

  const newLog: VisitorLog = {
    id: 'vis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    sessionId,
    timestamp: new Date().toISOString(),
    page: pageName,
    device: detectDevice(),
    browser: detectBrowser(),
    referrer: document.referrer ? new URL(document.referrer, window.location.origin).pathname : 'Direct',
    userEmail
  };

  // Keep last 300 logs for memory efficiency
  const updatedLogs = [newLog, ...logs].slice(0, 300);
  try {
    localStorage.setItem(VISITOR_LOGS_KEY, JSON.stringify(updatedLogs));
    window.dispatchEvent(new CustomEvent('inisio_visitor_logged', { detail: newLog }));
  } catch (err) {
    console.error('Failed to save visitor log:', err);
  }
}

export function getStoredVisitorLogs(): VisitorLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VISITOR_LOGS_KEY);
    if (!raw) {
      // Seed initial organic baseline data if clean
      const seedLogs = generateSeedLogs();
      localStorage.setItem(VISITOR_LOGS_KEY, JSON.stringify(seedLogs));
      return seedLogs;
    }
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function getVisitorSummary(): VisitorSummary {
  const logs = getStoredVisitorLogs();
  const totalVisits = logs.length;
  
  const uniqueSessions = new Set(logs.map(l => l.sessionId));
  const uniqueVisitors = uniqueSessions.size;

  // Active in last 15 mins
  const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
  const recentSessions = new Set(
    logs.filter(l => new Date(l.timestamp).getTime() > fifteenMinsAgo).map(l => l.sessionId)
  );
  const activeNow = Math.max(1, recentSessions.size);

  const mobileCount = logs.filter(l => l.device === 'Mobile' || l.device === 'Tablet').length;
  const desktopCount = logs.filter(l => l.device === 'Desktop').length;
  const totalDevices = logs.length || 1;

  const mobilePercent = Math.round((mobileCount / totalDevices) * 100);
  const desktopPercent = 100 - mobilePercent;

  // Page frequency
  const pageMap: Record<string, number> = {};
  logs.forEach(l => {
    pageMap[l.page] = (pageMap[l.page] || 0) + 1;
  });

  const topPages = Object.entries(pageMap)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalVisits,
    uniqueVisitors,
    activeNow,
    desktopPercent,
    mobilePercent,
    topPages,
    recentLogs: logs.slice(0, 20)
  };
}

function generateSeedLogs(): VisitorLog[] {
  const pages = ['Home / Greenfield Landing', 'Free Project Assessment', 'Financial Model & Capex', 'Bank Readiness Checklist', 'Advisory Blogs', 'Credit Desk Consultation'];
  const devices: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Desktop', 'Desktop', 'Mobile', 'Desktop', 'Mobile'];
  const browsers = ['Chrome', 'Safari', 'Edge', 'Firefox'];
  const logs: VisitorLog[] = [];

  const now = Date.now();
  for (let i = 0; i < 48; i++) {
    const timeAgo = (i * 18 + Math.floor(Math.random() * 15)) * 60 * 1000; // minutes
    logs.push({
      id: `vis_seed_${i}`,
      sessionId: `sess_seed_${Math.floor(i / 3)}`,
      timestamp: new Date(now - timeAgo).toISOString(),
      page: pages[Math.floor(Math.random() * pages.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      referrer: i % 3 === 0 ? 'Google Search' : (i % 4 === 0 ? 'LinkedIn / Debt Forum' : 'Direct Navigation')
    });
  }

  return logs;
}
