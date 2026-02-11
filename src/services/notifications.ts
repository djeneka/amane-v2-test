import { apiGet, apiPost } from '@/lib/api';

/** Types de notification renvoyés par l'API */
export type NotificationType =
  | 'TRANSACTION'
  | 'INVESTMENT'
  | 'TAKAFUL'
  | 'DONATION'
  | 'WALLET'
  | 'CAMPAIGN';

export type NotificationStatus = 'UNREAD' | 'READ';

/** Données additionnelles (structure variable selon le type) */
export type NotificationData = Record<string, unknown>;

/** Notification telle que renvoyée par GET /api/notifications */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Chemins des icônes par catégorie (purpose / type) */
export const NOTIFICATION_ICONS = {
  zakat: '/images/Image(4).png',
  investment: '/images/Image(6).png',
  donation: '/images/Image(5).png',
  default: '/images/Image(7).png',
} as const;

/**
 * Retourne l'icône à afficher pour une notification selon son type ou data.purpose.
 * ZAKAT n'est pas un type mais un purpose (TRANSACTION + purpose ZAKAT).
 */
export function getNotificationIcon(notification: Notification): string {
  const purpose = notification.data?.purpose as string | undefined;
  if (purpose === 'ZAKAT') return NOTIFICATION_ICONS.zakat;
  if (notification.type === 'INVESTMENT' || purpose === 'INVESTMENT') return NOTIFICATION_ICONS.investment;
  if (notification.type === 'DONATION' || purpose === 'DONATION') return NOTIFICATION_ICONS.donation;
  return NOTIFICATION_ICONS.default;
}

const NOTIFICATIONS_URL = '/api/notifications';
const NOTIFICATIONS_UNREAD_COUNT_URL = '/api/notifications/unread/count';
const NOTIFICATIONS_MARK_ALL_READ_URL = '/api/notifications/mark-all-read';

/**
 * Récupère toutes les notifications de l'utilisateur connecté.
 * Requiert un token Bearer valide.
 */
export async function getNotifications(token: string): Promise<Notification[]> {
  return apiGet<Notification[]>(NOTIFICATIONS_URL, { token });
}

/**
 * Récupère le nombre de notifications non lues de l'utilisateur connecté.
 * Requiert un token Bearer valide.
 */
export async function getUnreadNotificationsCount(token: string): Promise<number> {
  const res = await apiGet<{ count: number }>(NOTIFICATIONS_UNREAD_COUNT_URL, { token });
  return res.count;
}

/**
 * Marque une notification comme lue.
 * Requiert un token Bearer valide.
 * @returns La notification mise à jour (status READ, readAt renseigné).
 */
export async function markNotificationAsRead(
  notificationId: string,
  token: string
): Promise<Notification> {
  return apiPost<Notification>(
    `${NOTIFICATIONS_URL}/${notificationId}/read`,
    {},
    { token }
  );
}

/**
 * Marque toutes les notifications comme lues.
 * Requiert un token Bearer valide.
 * @returns Le nombre de notifications marquées comme lues.
 */
export async function markAllNotificationsAsRead(token: string): Promise<number> {
  const res = await apiPost<{ count: number }>(
    NOTIFICATIONS_MARK_ALL_READ_URL,
    {},
    { token }
  );
  return res.count;
}
