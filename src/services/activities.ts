import { apiGet } from '@/lib/api';

/** Document attaché à une activité (lien de téléchargement) */
export interface ActivityDocument {
  url: string;
  label: string;
}

/** Campagne embarquée dans une activité (retour API) */
export interface ActivityCampaign {
  id: string;
  title?: string;
  [key: string]: unknown;
}

/** Activité telle que renvoyée par l'API GET /api/activities */
export interface Activity {
  id: string;
  title: string;
  /** Description (peut être du HTML) */
  description: string;
  /** URL de la première vidéo (dérivé de videos[0] pour compatibilité) */
  video: string;
  /** Liste des URLs vidéo (format API) */
  videos: string[];
  /** Résultat / impact (peut être du HTML) */
  result: string;
  images: string[];
  /** Documents (rapports, récapitulatifs, etc.) */
  documents: ActivityDocument[];
  /** Montant déboursé pour cette activité (optionnel) */
  amountSpent?: number;
  createdById: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  /** ID de la campagne liée (si présent, "En savoir plus" redirige vers la page détail campagne) */
  campaignId?: string;
  /** Campagne embarquée (retour API) */
  campaign?: ActivityCampaign;
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

function normalizeDocument(doc: unknown): ActivityDocument | null {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return null;
  const d = doc as Record<string, unknown>;
  const url = typeof d.url === 'string' ? d.url : '';
  const label = typeof d.label === 'string' ? d.label : '';
  return url ? { url, label: label || url } : null;
}

function normalizeActivity(item: Record<string, unknown>): Activity {
  const videos = Array.isArray(item.videos)
    ? (item.videos as string[]).filter((v): v is string => typeof v === 'string')
    : [];
  const videoUrl =
    videos[0] ?? (typeof item.video === 'string' ? item.video : '');
  const rawCampaign = item.campaign && typeof item.campaign === 'object' && !Array.isArray(item.campaign)
    ? (item.campaign as Record<string, unknown>)
    : undefined;
  const campaignId =
    (typeof item.campaignId === 'string' && item.campaignId ? item.campaignId : undefined)
    ?? (typeof rawCampaign?.id === 'string' ? (rawCampaign.id as string) : undefined);
  const documents = Array.isArray(item.documents)
    ? (item.documents as unknown[])
        .map(normalizeDocument)
        .filter((doc): doc is ActivityDocument => doc !== null)
    : [];
  return {
    id: typeof item.id === 'string' ? item.id : '',
    title: typeof item.title === 'string' ? item.title : '',
    description: typeof item.description === 'string' ? item.description : '',
    video: videoUrl,
    videos,
    result: typeof item.result === 'string' ? item.result : '',
    images: Array.isArray(item.images) ? (item.images as string[]).filter((u): u is string => typeof u === 'string') : [],
    documents,
    amountSpent: typeof item.amountSpent === 'number' ? item.amountSpent : undefined,
    createdById: typeof item.createdById === 'string' ? item.createdById : '',
    status: typeof item.status === 'string' ? item.status : '',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
    campaignId: campaignId ?? undefined,
    campaign: rawCampaign
      ? {
          id: typeof rawCampaign.id === 'string' ? rawCampaign.id : '',
          title: typeof rawCampaign.title === 'string' ? rawCampaign.title : undefined,
          ...rawCampaign,
        }
      : undefined,
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
