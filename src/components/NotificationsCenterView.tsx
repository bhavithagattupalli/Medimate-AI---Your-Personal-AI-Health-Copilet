import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Heart,
  Calendar,
  ShieldAlert,
  Info,
  Clock,
  Sparkles,
  Send,
  RefreshCw,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { NotificationRecord, AppLanguage, AppTab } from '../types';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
  triggerTestNotification,
} from '../services/api';

interface NotificationsCenterViewProps {
  language: AppLanguage;
  onNavigateTab: (tab: AppTab) => void;
}

export const NotificationsCenterView: React.FC<NotificationsCenterViewProps> = ({
  language,
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [pushStatus, setPushStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const removed = notifications.find((n) => n.id === id);
      if (removed && !removed.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestNotification = async () => {
    try {
      const notif = await triggerTestNotification(
        language === 'te' ? 'హైడ్రేషన్ సూచన' : 'Midday Hydration Alert',
        language === 'te'
          ? 'మీరు ఇప్పటివరకు 1,800 మి.లీ నీరు తాగారు. లక్ష్యాన్ని చేరుకోవడానికి మరొక గ్లాస్ నీరు తీసుకోండి.'
          : 'You are 1,000 ml away from your daily 2,800 ml hydration target. Take a sip now!'
      );
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);

      // Trigger browser native notification if permitted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/favicon.ico',
        });
      }
    } catch (err) {
      alert('Failed to trigger test notification');
    }
  };

  const handleRequestPushPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser Push Notifications are not supported in this environment.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission === 'granted') {
        new Notification('MediMate AI Notifications Enabled', {
          body: 'You will receive timely medication reminders and clinical risk alerts.',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'unread') return !n.read;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (category: string, severity: string) => {
    if (severity === 'urgent') return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    switch (category) {
      case 'wellness':
        return <Heart className="w-4 h-4 text-emerald-600" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold relative">
              <Bell className="w-4 h-4 text-teal-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'నోటిఫికేషన్ల కేంద్రం' : 'Notifications & Alert Center'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te'
              ? 'మందుల రిమైండర్లు, వైద్య అపాయింట్‌మెంట్‌లు మరియు ఆరోగ్య సూచనలు.'
              : 'Real-time proactive notifications, scheduled medication alarms, clinical flags, and browser alerts.'}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestNotification}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'te' ? 'పరీక్ష అలర్ట్ పంపండి' : 'Test Alert'}</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'అన్నీ చదివినట్లు మార్క్ చేయండి' : 'Mark All Read'}</span>
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Push Notification Permission Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200/80 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-teal-700 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'te' ? 'బ్రౌజర్ పుష్ నోటిఫికేషన్లు' : 'Desktop & Mobile Browser Push'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {pushStatus === 'granted'
                ? language === 'te'
                  ? 'పుష్ నోటిఫికేషన్లు అనుమతించబడ్డాయి. మీరు సకాలంలో రిమైండర్‌లను అందుకుంటారు.'
                  : 'Web Push alerts are active. You will receive prompt vital & pill reminders.'
                : language === 'te'
                ? 'యాప్ మూసి ఉన్నప్పుడు కూడా ముఖ్యమైన రిమైండర్‌లను స్వీకరించడానికి పుష్ ప్రారంభించండి.'
                : 'Enable browser push notifications to get critical alerts even when the tab is idle.'}
            </p>
          </div>
        </div>

        {pushStatus !== 'granted' ? (
          <button
            onClick={handleRequestPushPermission}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap"
          >
            {language === 'te' ? 'పుష్ అనుమతించండి' : 'Enable Push Alerts'}
          </button>
        ) : (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full whitespace-nowrap">
            ✓ Push Active
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: language === 'te' ? 'అన్నీ' : 'All Alerts' },
            { id: 'unread', label: `${language === 'te' ? 'చదవనివి' : 'Unread'} (${unreadCount})` },
            { id: 'wellness', label: language === 'te' ? 'వెల్‌నెస్' : 'Wellness' },
            { id: 'reminder', label: language === 'te' ? 'రిమైండర్లు' : 'Reminders' },
            { id: 'risk', label: language === 'te' ? 'రిస్క్ అలర్ట్‌లు' : 'Clinical Flags' },
            { id: 'system', label: language === 'te' ? 'సిస్టమ్' : 'System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterCategory === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleClearRead}
          className="text-xs text-slate-400 hover:text-slate-700 whitespace-nowrap font-medium"
        >
          {language === 'te' ? 'చదివినవి తొలగించండి' : 'Clear Read'}
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
          <p className="text-xs font-medium">Fetching notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'te' ? 'ఎటువంటి నోటిఫికేషన్లు లేవు' : 'No Notifications'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isUnread
                    ? 'border-teal-300 bg-teal-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.severity === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : isUnread
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {getCategoryIcon(notif.category, notif.severity)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                      )}
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium uppercase">
                        {notif.category}
                      </span>
                      {notif.severity === 'urgent' && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded uppercase">
                          High Urgency
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{notif.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {notif.actionTab && (
                        <button
                          onClick={() => {
                            handleMarkRead(notif.id);
                            onNavigateTab(notif.actionTab as AppTab);
                          }}
                          className="font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                        >
                          <span>Open View</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-xs text-teal-700 hover:bg-teal-50 px-2.5 py-1 rounded-lg font-medium transition"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
