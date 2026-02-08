import { apiGet } from '@/lib/api';
import type { Campaign } from '@/data/mockData';

/** Réponse campagne telle que renvoyée par l'API backend */
export interface ApiCampaign {
  id: string;
  title: string;
  description: string;
  goals: string;
  beneficiaries: string[];
  picture: string | null;
  startDate: string | null;
  endDate: string | null;
  category: string;
  type: string;
  status: string;
  targetAmount: number;
  currentAmount: number;
  location: string | null;
  [key: string]: unknown;
}

const API_CATEGORY_TO_FRONT: Record<string, Campaign['category']> = {
  HEALTH: 'sante',
  EDUCATION: 'education',
  FOOD: 'urgence',
  OTHER: 'autres',
  URGENCE: 'urgence',
  REFUGIES: 'refugies',
};

const DEFAULT_CAMPAIGN_IMAGE = '/images/no-picture.png';

function mapApiCampaignToCampaign(api: ApiCampaign): Campaign {
  const category =
    API_CATEGORY_TO_FRONT[api.category.toUpperCase()] ?? 'autres';
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    image: (api.picture && api.picture.trim()) ? api.picture : DEFAULT_CAMPAIGN_IMAGE,
    targetAmount: typeof api.targetAmount === 'number' ? api.targetAmount : 0,
    currentAmount: typeof api.currentAmount === 'number' ? api.currentAmount : 0,
    category,
    location: api.location ?? '',
    endDate: api.endDate ?? new Date().toISOString(),
    impact: api.goals ?? '',
    beneficiaries: Array.isArray(api.beneficiaries) ? api.beneficiaries.length : 0,
    status: api.status === 'ACTIVE' ? 'active' : api.status === 'COMPLETED' ? 'completed' : 'upcoming',
  };
}

/**
 * Récupère toutes les campagnes actives depuis l'API (données brutes avec category API).
 * GET /api/campaigns?status=ACTIVE
 */
export async function getActiveCampaignsRaw(): Promise<ApiCampaign[]> {
  const list = await apiGet<ApiCampaign[]>('/api/campaigns?status=ACTIVE');
  return Array.isArray(list) ? list : [];
}

/**
 * Récupère toutes les campagnes actives depuis l'API.
 * GET /api/campaigns?status=ACTIVE
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  const list = await getActiveCampaignsRaw();
  return list.map(mapApiCampaignToCampaign);
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const campaign = await apiGet<ApiCampaign>(`/api/campaigns/${id}`);
  return campaign ? mapApiCampaignToCampaign(campaign) : null;
}
