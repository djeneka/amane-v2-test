import { apiGet } from '@/lib/api';

/** Entrée d'historique sadaqah (réponse GET /api/sadaqah-history) */
export interface SadaqahHistoryEntry {
  id: string;
  userId: string;
  score: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** Entrée du classement (réponse GET /api/ranking) */
export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  profilePicture: string;
  score: number;
}

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

/**
 * Récupère l'historique sadaqah de l'utilisateur connecté.
 * GET /api/sadaqah-history (authentifié)
 */
export async function mySadaqahHistory(token: string): Promise<SadaqahHistoryEntry[]> {
  const data = await apiGet<SadaqahHistoryEntry[]>('/api/sadaqah-history', { token });
  if (!Array.isArray(data)) return [];
  return data.map((entry) => ({
    id: String(entry.id ?? ''),
    userId: String(entry.userId ?? ''),
    score: typeof entry.score === 'number' ? entry.score : 0,
    description: String(entry.description ?? ''),
    createdAt: String(entry.createdAt ?? ''),
    updatedAt: String(entry.updatedAt ?? ''),
  }));
}

/**
 * Récupère le classement des utilisateurs (ranking).
 * GET /api/ranking
 */
export async function getMyRank(options?: { token?: string }): Promise<RankingEntry[]> {
  const data = await apiGet<RankingEntry[]>('/api/ranking', options);
  if (!Array.isArray(data)) return [];
  return data.map((entry) => ({
    rank: typeof entry.rank === 'number' ? entry.rank : 0,
    userId: String(entry.userId ?? ''),
    name: String(entry.name ?? ''),
    profilePicture: String(entry.profilePicture ?? ''),
    score: typeof entry.score === 'number' ? entry.score : 0,
  }));
}
