// Inisio Visitor & Website Traffic Analytics Store
import { escapeCSV, downloadCSV } from './leadStore';

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
      return [];
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
  const activeNow = recentSessions.size;

  const mobileCount = logs.filter(l => l.device === 'Mobile' || l.device === 'Tablet').length;
  const desktopCount = logs.filter(l => l.device === 'Desktop').length;
  const totalDevices = logs.length || 1;

  const mobilePercent = totalVisits > 0 ? Math.round((mobileCount / totalDevices) * 100) : 0;
  const desktopPercent = totalVisits > 0 ? 100 - mobilePercent : 0;

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

export function exportVisitorsToCSV(logsToExport?: VisitorLog[]): void {
  const logs = (logsToExport && logsToExport.length > 0) ? logsToExport : getStoredVisitorLogs();
  if (logs.length === 0) {
    alert('No visitor traffic logs to export.');
    return;
  }

  const headers = [
    'Log ID',
    'Session ID',
    'Visit Date & Time',
    'Page Visited',
    'Device Type',
    'Browser',
    'Referrer / Traffic Channel',
    'Authenticated User Email'
  ];

  const rows = logs.map(l => {
    let dateStr = l.timestamp || '';
    if (l.timestamp) {
      const d = new Date(l.timestamp);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    }

    return [
      escapeCSV(l.id || ''),
      escapeCSV(l.sessionId || ''),
      escapeCSV(dateStr),
      escapeCSV(l.page || ''),
      escapeCSV(l.device || 'Desktop'),
      escapeCSV(l.browser || 'Browser'),
      escapeCSV(l.referrer || 'Direct'),
      escapeCSV(l.userEmail || 'Anonymous')
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `Inisio_Website_Visitors_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
}

