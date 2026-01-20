'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Notification {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  isRead: boolean;
}

interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPopup({ isOpen, onClose }: NotificationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Données de notifications
  const notificationGroups: NotificationGroup[] = [
    {
      date: 'Aujourd\'hui',
      notifications: [
        {
          id: 1,
          type: 'zakat',
          title: 'Rappel de la Zakat',
          description: 'C\'est bientôt le moment de purifier ton revenu. Penses-y 🙏',
          time: '1h',
          icon: '/images/Image(4).png',
          isRead: false,
        },
        {
          id: 2,
          type: 'don',
          title: 'Confirmation de don',
          description: 'Merci pour ton don à la mosquée Al Falah. Qu\'Allah t\'en récompense !',
          time: '2h',
          icon: '/images/Image(4).png',
          isRead: true,
        },
        {
          id: 3,
          type: 'campagne',
          title: 'Mise à jour de cagnotte',
          description: 'La campagne "Soutien aux orphelins" atteint 80% de son objectif !',
          time: '8h',
          icon: '/images/Image(5).png',
          isRead: true,
        },
      ],
    },
    {
      date: 'Hier',
      notifications: [
        {
          id: 4,
          type: 'investissement',
          title: 'Nouveau projet halal',
          description: 'Investis dans un projet éthique conforme à la finance islamique.',
          time: '1 j',
          icon: '/images/Image(6).png',
          isRead: true,
        },
      ],
    },
  ];

  // Calculer le nombre de notifications non lues
  const unreadCount = notificationGroups.reduce(
    (count, group) => count + group.notifications.filter(n => !n.isRead).length,
    0
  );

  // Fermer le popup quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand le popup est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleMarkAsRead = (groupId: number) => {
    // Logique pour marquer comme lus (à implémenter selon vos besoins)
    console.log('Marquer comme lus pour le groupe', groupId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          <div
            ref={popupRef}
            className="absolute pointer-events-auto right-4 top-20"
          >
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
                {notificationGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-4">
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium text-sm">{group.date}</h4>
                      <button
                        onClick={() => handleMarkAsRead(groupIndex)}
                        className="text-[#00D9A5] text-xs font-medium hover:underline"
                      >
                        Marquer comme lus
                      </button>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-3">
                      {group.notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start space-x-3 p-3 rounded-lg ${
                            !notification.isRead ? 'bg-[#00644D]/20' : 'hover:bg-[#101919]/50'
                          } transition-colors`}
                        >
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-full bg-[#00D9A5]/20 flex items-center justify-center flex-shrink-0">
                            <Image src={notification.icon} alt={notification.title} width={48} height={48} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-white font-bold text-sm mb-1">
                                  {notification.title}
                                </p>
                                <p className="text-white/70 text-xs leading-relaxed">
                                  {notification.description}
                                </p>
                              </div>
                              <span className="text-white/50 text-xs ml-2 flex-shrink-0">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
