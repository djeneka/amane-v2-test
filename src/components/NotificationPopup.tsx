'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationIcon,
  type Notification as ApiNotification,
} from '@/services/notifications';

interface NotificationGroup {
  date: string;
  notifications: ApiNotification[];
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getGroupDateLabel(createdAt: string): string {
  const date = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function groupNotificationsByDate(notifications: ApiNotification[]): NotificationGroup[] {
  const groups: Record<string, ApiNotification[]> = {};
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  for (const n of sorted) {
    const label = getGroupDateLabel(n.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  const order = ["Aujourd'hui", 'Hier'];
  const rest = Object.keys(groups).filter((k) => !order.includes(k));
  const orderedKeys = [...order.filter((k) => groups[k]), ...rest];
  return orderedKeys.map((date) => ({ date, notifications: groups[date] }));
}

export default function NotificationPopup({ isOpen, onClose }: NotificationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        getNotifications(accessToken),
        getUnreadNotificationsCount(accessToken),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOpen && accessToken) fetchNotifications();
  }, [isOpen, accessToken, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!accessToken) return;
    setMarkingId(notificationId);
    try {
      const updated = await markNotificationAsRead(notificationId, accessToken);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? updated : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Erreur marquer comme lu:', err);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkGroupAsRead = async (group: NotificationGroup) => {
    const unread = group.notifications.filter((n) => n.status === 'UNREAD');
    if (!accessToken || unread.length === 0) return;
    for (const n of unread) {
      try {
        const updated = await markNotificationAsRead(n.id, accessToken);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? updated : item))
        );
      } catch (err) {
        console.error('Erreur marquer comme lu:', err);
      }
    }
    setUnreadCount((c) => Math.max(0, c - unread.length));
  };

  const handleMarkAllAsRead = async () => {
    if (!accessToken || unreadCount === 0) return;
    setMarkingId('all');
    try {
      await markAllNotificationsAsRead(accessToken);
      await fetchNotifications();
    } catch (err) {
      console.error('Erreur tout marquer comme lu:', err);
    } finally {
      setMarkingId(null);
    }
  };

  /** Clic sur une notification : redirection selon le type (campagne, investissement, takaful), puis marquer comme lu */
  const handleNotificationClick = (notification: ApiNotification) => {
    const data = notification.data || {};
    const campaignId = data.campaignId as string | undefined;
    const investmentProductId = data.investmentProductId as string | undefined;
    const takafulPlanId = data.takafulPlanId as string | undefined;

    if (campaignId) {
      onClose();
      router.push(`/campagnes/${campaignId}`);
    } else if (notification.type === 'INVESTMENT' && investmentProductId) {
      onClose();
      router.push(`/investir/${investmentProductId}`);
    } else if (notification.type === 'TAKAFUL' && takafulPlanId) {
      onClose();
      router.push(`/takaful/${takafulPlanId}`);
    }

    if (notification.status === 'UNREAD') {
      handleMarkAsRead(notification.id);
    }
  };

  const notificationGroups = groupNotificationsByDate(notifications);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          <div ref={popupRef} className="absolute pointer-events-auto right-4 top-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1A1A1A] rounded-2xl rounded-tr-none border border-white/10 shadow-2xl w-96 max-h-[600px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white text-xl font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="w-6 h-6 rounded-full bg-[#00D9A5] border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{unreadCount}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#101919] hover:bg-[#101919]/80 flex items-center justify-center transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} className="text-[#00D9A5]" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1">
                {!accessToken ? (
                  <div className="p-4 text-white/70 text-sm text-center">
                    Connectez-vous pour voir vos notifications.
                  </div>
                ) : loading ? (
                  <div className="p-4 text-white/70 text-sm text-center">
                    Chargement…
                  </div>
                ) : notificationGroups.length === 0 ? (
                  <div className="p-4 text-white/70 text-sm text-center">
                    Aucune notification.
                  </div>
                ) : (
                  <>
                    {unreadCount > 0 && (
                      <div className="px-4 pt-3 pb-1">
                        <button
                          onClick={handleMarkAllAsRead}
                          disabled={markingId === 'all'}
                          className="text-[#00D9A5] text-xs font-medium hover:underline disabled:opacity-50"
                        >
                          {markingId === 'all' ? 'En cours…' : 'Tout marquer comme lu'}
                        </button>
                      </div>
                    )}
                    {notificationGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium text-sm capitalize">
                            {group.date}
                          </h4>
                          {group.notifications.some((n) => n.status === 'UNREAD') && (
                            <button
                              onClick={() => handleMarkGroupAsRead(group)}
                              className="text-[#00D9A5] text-xs font-medium hover:underline"
                            >
                              Marquer comme lus
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {group.notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer ${
                                notification.status === 'UNREAD'
                                  ? 'bg-[#00644D]/20'
                                  : 'hover:bg-[#101919]/50'
                              } transition-colors`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="w-12 h-12 rounded-full bg-[#00D9A5]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <Image
                                  src={getNotificationIcon(notification)}
                                  alt={notification.title}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-white font-bold text-sm mb-1">
                                      {notification.title}
                                    </p>
                                    <p className="text-white/70 text-xs leading-relaxed">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <span className="text-white/50 text-xs ml-2 flex-shrink-0">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
