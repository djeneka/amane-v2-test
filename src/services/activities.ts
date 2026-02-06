import { apiGet } from '@/lib/api';

/** Activité telle que renvoyée par l'API GET /api/activities */
export interface Activity {
  id: string;
  title: string;
  description: string;
  video: string;
  result: string;
  images: string[];
  createdById: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** Messages de retour explicites du service */
export const ActivitiesMessages = {
  SUCCESS: 'Activités chargées avec succès.',
  ERROR_NETWORK: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
  ERROR_SERVER: 'Le serveur ne répond pas correctement. Réessayez plus tard.',
  ERROR_INVALID_RESPONSE: 'Réponse invalide du serveur (format des activités incorrect).',
  ERROR_UNKNOWN: 'Une erreur inattendue s\'est produite lors du chargement des activités.',
} as const;

/** Résultat typé avec message explicite */
export type GetActivitiesResult =
  | { success: true; data: Activity[]; message: string }
  | { success: false; error: string; code: string };

function normalizeActivity(item: Record<string, unknown>): Activity {
  return {
    id: typeof item.id === 'string' ? item.id : '',
    title: typeof item.title === 'string' ? item.title : '',
    description: typeof item.description === 'string' ? item.description : '',
    video: typeof item.video === 'string' ? item.video : '',
    result: typeof item.result === 'string' ? item.result : '',
    images: Array.isArray(item.images) ? (item.images as string[]) : [],
    createdById: typeof item.createdById === 'string' ? item.createdById : '',
    status: typeof item.status === 'string' ? item.status : '',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
  };
}

/**
 * Récupère la liste des activités depuis l'API.
 * GET /api/activities
 * @returns Résultat avec message explicite (succès ou erreur)
 */
export async function getActivities(): Promise<GetActivitiesResult> {
  try {
    const list = await apiGet<unknown>('/api/activities');

    if (!Array.isArray(list)) {
      return {
        success: false,
        error: ActivitiesMessages.ERROR_INVALID_RESPONSE,
        code: 'INVALID_RESPONSE',
      };
    }

    const data = list
      .map((item) => normalizeActivity(item as Record<string, unknown>))
      .filter((activity) => activity.status === 'PUBLISHED');

    return {
      success: true,
      data,
      message: ActivitiesMessages.SUCCESS,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    const isNetwork =
      message.includes('Failed to fetch') ||
      message.includes('NetworkError') ||
      message.includes('Load failed');

    if (isNetwork) {
      return {
        success: false,
        error: ActivitiesMessages.ERROR_NETWORK,
        code: 'NETWORK_ERROR',
      };
    }

    if (message.startsWith('HTTP 5') || message.startsWith('HTTP 4')) {
      return {
        success: false,
        error: ActivitiesMessages.ERROR_SERVER,
        code: 'SERVER_ERROR',
      };
    }

    return {
      success: false,
      error: message || ActivitiesMessages.ERROR_UNKNOWN,
      code: 'UNKNOWN_ERROR',
    };
  }
}
