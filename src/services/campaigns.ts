import { apiGet } from '@/lib/api';
import type { Campaign, CampaignActivity } from '@/data/mockData';

/** Activité d'une campagne (réponse API) */
export interface ApiCampaignActivity {
  id?: string;
  title?: string;
  description?: string;
  videos?: string[];
  images?: string[];
  amountSpent?: number;
  result?: string;
  [key: string]: unknown;
}

/** Réponse campagne telle que renvoyée par l'API backend (getCampaignById / list) */
export interface ApiCampaign {
  id: string;
  title: string;
  description: string;
  goals?: string;
  beneficiaries?: string[];
  picture: string | null;
  /** Autres images de la campagne (galerie) */
  otherPictures?: string[];
  startDate: string | null;
  endDate: string | null;
  category: string;
  type: string;
  status: string;
  targetAmount: number;
  currentAmount: number;
  amountSpent?: number;
  location: string | null;
  featured?: boolean;
  /** Process / étapes (HTML possible) */
  process?: string;
  /** Activités avec médias (videos, images) */
  activities?: ApiCampaignActivity[];
  /** Budget prévisionnel (URL ou document) */
  provisionalBudget?: string | null;
  /** Relevé / état financier (URL ou document) */
  financialStatement?: string | null;
  /** Durée du programme (ex. PONCTUAL pour programmes ponctuels) */
  duration?: string;
  project?: unknown;
  createdBy?: unknown;
  [key: string]: unknown;
}

const API_CATEGORY_TO_FRONT: Record<string, Campaign['category']> = {
  HEALTH: 'sante',
  EDUCATION: 'education',
  FOOD: 'urgence',
  OTHER: 'autres',
  URGENCE: 'urgence',
  REFUGIES: 'refugies',
  SPECIAL_RAMADAN: 'special-ramadan',
  SPECIAL_TABASKI: 'special-tabaski',
  DEVELOPMENT: 'developpement',
  HOUSING: 'developpement',
};

const DEFAULT_CAMPAIGN_IMAGE = '/images/no-picture.png';

function mapApiCampaignToCampaign(api: ApiCampaign): Campaign {
  const category =
    API_CATEGORY_TO_FRONT[api.category?.toUpperCase?.() ?? ''] ?? 'autres';
  const mainImage =
    api.picture && typeof api.picture === 'string' && api.picture.trim()
      ? api.picture
      : DEFAULT_CAMPAIGN_IMAGE;
  const otherPics = Array.isArray(api.otherPictures)
    ? api.otherPictures.filter((url): url is string => typeof url === 'string' && !!url.trim())
    : [];
  const activityImages =
    Array.isArray(api.activities) ?
      api.activities.flatMap((a) => (Array.isArray(a.images) ? a.images : [])) :
      [];
  const allImages = [mainImage, ...otherPics, ...activityImages].filter(Boolean);
  const firstVideo =
    Array.isArray(api.activities) &&
    api.activities[0]?.videos?.length
      ? api.activities[0].videos[0]
      : undefined;

  const activities: CampaignActivity[] = Array.isArray(api.activities)
    ? api.activities.map((a) => ({
        id: typeof a.id === 'string' ? a.id : undefined,
        title: typeof a.title === 'string' ? a.title : undefined,
        description: typeof a.description === 'string' ? a.description : undefined,
        amountSpent: typeof a.amountSpent === 'number' ? a.amountSpent : undefined,
        result: typeof a.result === 'string' ? a.result : undefined,
        videos: Array.isArray(a.videos) ? a.videos.filter((v): v is string => typeof v === 'string') : undefined,
        images: Array.isArray(a.images) ? a.images.filter((v): v is string => typeof v === 'string') : undefined,
      }))
    : [];

  return {
    id: api.id,
    title: api.title,
    description: api.description,
    image: mainImage,
    images: allImages.length > 0 ? allImages : undefined,
    video: typeof firstVideo === 'string' ? firstVideo : undefined,
    targetAmount: typeof api.targetAmount === 'number' ? api.targetAmount : 0,
    currentAmount: typeof api.currentAmount === 'number' ? api.currentAmount : 0,
    amountSpent: typeof api.amountSpent === 'number' ? api.amountSpent : 0,
    type: api.type ?? 'SADAQAH',
    category,
    location: api.location ?? '',
    endDate: api.endDate ?? null,
    impact: api.goals ?? '',
    beneficiaries: Array.isArray(api.beneficiaries) ? api.beneficiaries.length : 0,
    beneficiariesList: Array.isArray(api.beneficiaries)
      ? api.beneficiaries.filter((b): b is string => typeof b === 'string')
      : undefined,
    status: api.status === 'ACTIVE' ? 'active' : api.status === 'COMPLETED' ? 'completed' : 'upcoming',
    featured: Boolean(api.featured),
    provisionalBudget: api.provisionalBudget ?? null,
    financialStatement: api.financialStatement ?? null,
    process: api.process ?? null,
    activities: activities.length > 0 ? activities : undefined,
    duration: typeof api.duration === 'string' ? api.duration : undefined,
  };
}

/**
 * Récupère toutes les campagnes actives depuis l'API (données brutes avec category API).
 * GET /api/campaigns?status=ACTIVE ou avec &duration=PONCTUAL
 */
export async function getActiveCampaignsRaw(options?: { duration?: string }): Promise<ApiCampaign[]> {
  const params = new URLSearchParams({ status: 'ACTIVE' });
  if (options?.duration) params.set('duration', options.duration);
  const list = await apiGet<ApiCampaign[]>(`/api/campaigns?${params.toString()}`);
  return Array.isArray(list) ? list : [];
}

/**
 * Récupère toutes les campagnes actives depuis l'API.
 * GET /api/campaigns?status=ACTIVE
 * @param options.duration - Filtre optionnel (ex. "PONCTUAL" pour programmes ponctuels)
 */
export async function getActiveCampaigns(options?: { duration?: string }): Promise<Campaign[]> {
  const list = await getActiveCampaignsRaw(options);
  return list.map(mapApiCampaignToCampaign);
}

/**
 * Récupère une campagne par ID. Utilise d'abord la liste des campagnes actives
 * (même source que la liste) pour éviter les écarts de données, sinon appelle GET /api/campaigns/:id.
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const list = await apiGet<ApiCampaign[]>(
    `/api/campaigns?${new URLSearchParams({ status: 'ACTIVE' }).toString()}`,
    { cache: 'no-store' }
  );
  const inList = Array.isArray(list) ? list.find((c) => c.id === id) : null;
  if (inList) {
    return mapApiCampaignToCampaign(inList);
  }
  const campaign = await apiGet<ApiCampaign>(`/api/campaigns/${id}`, { cache: 'no-store' });
  return campaign ? mapApiCampaignToCampaign(campaign) : null;
}
