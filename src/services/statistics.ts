import { apiGet } from '@/lib/api';

/** Dons agrégés par campagne (réponse API) */
export interface DonationsByCampaign {
  campaignId: string;
  campaignTitle: string;
  count: number;
}

/** Réponse GET /api/statistics/donations */
export interface DonationsStatistics {
  total: number;
  totalAmount: number;
  byCampaign: DonationsByCampaign[];
}

/**
 * Récupère les statistiques des dons (total, montant total, répartition par campagne).
 * GET /api/statistics/donations
 */
export async function getDonationsStatistics(): Promise<DonationsStatistics> {
  const data = await apiGet<DonationsStatistics>('/api/statistics/donations');
  return {
    total: typeof data.total === 'number' ? data.total : 0,
    totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
    byCampaign: Array.isArray(data.byCampaign) ? data.byCampaign : [],
  };
}
