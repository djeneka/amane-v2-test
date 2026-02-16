import { apiGet, apiPatch } from '@/lib/api';
import { getCurrentUser } from '@/services/user';

/** Entrée d'historique sadaqah (réponse GET /api/sadaqah-history) */
export interface SadaqahHistoryEntry {
  id: string;
  userId: string;
  score: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** Entrée du classement (réponse GET /api/ranking?category=...) */
export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  profilePicture: string;
  score: number;
  category?: string;
  anonymous?: boolean;
}

/** Réponse PATCH /api/ranking/anonymize/{userId} */
export interface AnonymizeRankingResponse {
  id: string;
  userId: string;
  score: number;
  anonymous: boolean;
  category: string;
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
 * Récupère le classement des utilisateurs par catégorie.
 * Récupère la catégorie de l'utilisateur connecté via GET /api/users/me puis appelle GET /api/ranking?category=...
 * @param options.token - JWT requis pour /me et /api/ranking
 */
export async function getMyRank(options?: { token?: string }): Promise<RankingEntry[]> {
  const token = options?.token;
  if (!token) return [];

  const user = await getCurrentUser(token);
  const category = user?.score?.category ?? 'NONE';

  const url = `/api/ranking?category=${encodeURIComponent(category)}`;
  const data = await apiGet<RankingEntry[]>(url, { token });
  if (!Array.isArray(data)) return [];

  return data.map((entry) => ({
    rank: typeof entry.rank === 'number' ? entry.rank : 0,
    userId: String(entry.userId ?? ''),
    name: String(entry.name ?? ''),
    profilePicture: String(entry.profilePicture ?? ''),
    score: typeof entry.score === 'number' ? entry.score : 0,
    category: entry.category != null ? String(entry.category) : undefined,
    anonymous: typeof entry.anonymous === 'boolean' ? entry.anonymous : false,
  }));
}

const ANONYMIZE_RANKING_URL = '/api/ranking/anonymize';

/**
 * Passe le profil de classement en mode anonyme (ou désanonymise).
 * PATCH /api/ranking/anonymize/{userId}
 * @param userId - ID de l'utilisateur connecté
 * @param options.token - JWT requis
 * @param options.anonymous - true pour anonyme, false pour afficher le nom (défaut: true)
 */
export async function passToAnonymous(
  userId: string,
  options: { token: string; anonymous?: boolean }
): Promise<AnonymizeRankingResponse> {
  const url = `${ANONYMIZE_RANKING_URL}/${encodeURIComponent(userId)}`;
  const data = await apiPatch<AnonymizeRankingResponse>(url, { anonymous: options.anonymous ?? true }, { token: options.token });
  return {
    id: String(data.id ?? ''),
    userId: String(data.userId ?? ''),
    score: typeof data.score === 'number' ? data.score : 0,
    anonymous: typeof data.anonymous === 'boolean' ? data.anonymous : true,
    category: String(data.category ?? 'NONE'),
  };
}
