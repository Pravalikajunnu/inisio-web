import React, { useState, useEffect } from 'react';
import { AdminNotification, getAdminNotifications, markAllNotificationsAsRead, clearAllNotifications } from '../utils/notificationStore';
import { Bell, X, CheckCircle2, Trash2, ShieldCheck, Activity, Download, FileCheck2, Users, FileText } from 'lucide-react';

interface AdminNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationModal: React.FC<AdminNotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
    const handleUpdate = () => loadNotifications();
    window.addEventListener('inisio_admin_notification_added', handleUpdate);
    return () => window.removeEventListener('inisio_admin_notification_added', handleUpdate);
  }, [isOpen]);

  const loadNotifications = () => {
    setNotifications(getAdminNotifications().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      clearAllNotifications();
      loadNotifications();
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch(type) {
      case 'PROJECT_MODIFIED': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'TEASER_DOWNLOAD': return <Download className="w-4 h-4 text-amber-600" />;
      case 'ASSESSMENT_SUBMITTED': return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'CONSULTATION_BOOKED': return <Users className="w-4 h-4 text-purple-600" />;
      case 'CA_AUDIT_UPDATE': return <FileText className="w-4 h-4 text-indigo-600" />;
      default: return <Bell className="w-4 h-4 text-zinc-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-white w-full max-w-sm sm:max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">System Alerts &amp; Audit Log</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Real-time tracking of platform activity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between bg-white text-xs">
          <span className="font-semibold text-zinc-500">{notifications.length} Total Alerts</span>
          <div className="flex items-center gap-3">
            <button onClick={handleMarkAllRead} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
              Mark all read
            </button>
            <button onClick={handleClearAll} className="text-red-500 hover:text-red-700 font-medium cursor-pointer">
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No recent activity found.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 rounded-xl border transition-all ${
                  !notif.read ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    !notif.read ? 'bg-white shadow-sm' : 'bg-zinc-100'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs truncate ${!notif.read ? 'font-bold text-zinc-900' : 'font-semibold text-zinc-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">
                        {new Date(notif.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${!notif.read ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
