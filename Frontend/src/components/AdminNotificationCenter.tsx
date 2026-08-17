import React, { useState, useEffect } from 'react';
import {
  AdminNotification,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  getUnreadNotificationCount
} from '../utils/notificationStore';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  FileText,
  Edit3,
  Calendar,
  ShieldCheck,
  Download,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface AdminNotificationCenterProps {
  onSelectLead?: (emailOrProject: string) => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({ onSelectLead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TEASER_DOWNLOAD' | 'PROJECT_MODIFIED' | 'ASSESSMENT_SUBMITTED'>('ALL');

  const refreshNotifications = () => {
    const list = getAdminNotifications();
    setNotifications(list);
    setUnreadCount(getUnreadNotificationCount());
  };

  useEffect(() => {
    refreshNotifications();
    const handleUpdate = () => refreshNotifications();
    window.addEventListener('inisio_admin_notification_added', handleUpdate);
    
    // Check every 10 seconds for updates
    const interval = setInterval(refreshNotifications, 10000);
    return () => {
      window.removeEventListener('inisio_admin_notification_added', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    refreshNotifications();
  };

  const handleClearAll = () => {
    if (confirm('Clear all admin notifications?')) {
      clearAllNotifications();
      refreshNotifications();
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    return n.type === activeFilter;
  });

  const getIconForType = (type: AdminNotification['type']) => {
    switch (type) {
      case 'TEASER_DOWNLOAD':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'PROJECT_MODIFIED':
        return <Edit3 className="w-4 h-4 text-amber-500" />;
      case 'ASSESSMENT_SUBMITTED':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'CONSULTATION_BOOKED':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'CA_AUDIT_UPDATE':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="admin-notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center justify-center cursor-pointer"
        title="Admin Notifications & Activity Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center px-1 shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over / Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-[360px] sm:w-[420px] max-h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-inter animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-sm text-white">Admin Activity &amp; Alerts</h3>
                  <p className="text-[11px] text-slate-400">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-2 py-1 text-[11px] font-semibold text-blue-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1 text-[11px] font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('TEASER_DOWNLOAD')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'TEASER_DOWNLOAD'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Teasers
              </button>
              <button
                onClick={() => setActiveFilter('PROJECT_MODIFIED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'PROJECT_MODIFIED'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Edits
              </button>
              <button
                onClick={() => setActiveFilter('ASSESSMENT_SUBMITTED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'ASSESSMENT_SUBMITTED'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Assessments
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px]">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No notifications in this filter.</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) {
                        markNotificationAsRead(item.id);
                        refreshNotifications();
                      }
                    }}
                    className={`p-3.5 transition-colors flex gap-3 items-start cursor-pointer ${
                      !item.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                      {getIconForType(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-snug">
                        {item.message}
                      </p>

                      {item.projectName && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          <span>{item.projectName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {item.userEmail && (
                          <a
                            href={`https://wa.me/916302026462?text=Hello%20${encodeURIComponent(item.userName || 'Promoter')},%20regarding%20your%20project%20${encodeURIComponent(item.projectName || '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {!item.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(item.id);
                              refreshNotifications();
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">Real-time desk synchronization</span>
              <button
                onClick={handleClearAll}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
