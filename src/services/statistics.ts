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

/** Métadonnées de pagination du classement */
export interface RankingMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Réponse paginée GET /api/ranking?category=...&page=...&limit=... */
export interface RankingResponse {
  data: RankingEntry[];
  meta: RankingMeta;
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
  const data = await apiGet<DonationsStatistics>('/api/statistics/donations', { cache: 'no-store' });
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
 * Récupère le classement paginé par catégorie.
 * Récupère la catégorie de l'utilisateur connecté via GET /api/users/me puis appelle GET /api/ranking?category=...&page=...&limit=...
 * @param options.token - JWT requis
 * @param options.page - Numéro de page (défaut: 1)
 * @param options.limit - Nombre par page (défaut: 10)
 */
export async function getMyRank(options?: {
  token?: string;
  page?: number;
  limit?: number;
}): Promise<RankingResponse> {
  const token = options?.token;
  if (!token) return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

  const user = await getCurrentUser(token);
  const category = user?.score?.category ?? 'NONE';
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  const url = `/api/ranking?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`;
  const raw = await apiGet<{ data?: unknown[]; meta?: { total?: number; page?: number; limit?: number; totalPages?: number } }>(url, { token });

  const data = Array.isArray(raw?.data) ? raw.data : [];
  const meta = raw?.meta ?? {};
  const entries: RankingEntry[] = data.map((entry: Record<string, unknown>) => {
    const rawPic = entry.profilePicture;
    const profilePicture =
      rawPic != null && rawPic !== '' && String(rawPic).trim().startsWith('http')
        ? String(rawPic).trim()
        : '';
    return {
      rank: typeof entry.rank === 'number' ? entry.rank : 0,
      userId: String(entry.userId ?? ''),
      name: String(entry.name ?? ''),
      profilePicture,
      score: typeof entry.score === 'number' ? entry.score : 0,
      category: entry.category != null ? String(entry.category) : undefined,
      anonymous: typeof entry.anonymous === 'boolean' ? entry.anonymous : false,
    };
  });

  return {
    data: entries,
    meta: {
      total: typeof meta.total === 'number' ? meta.total : 0,
      page: typeof meta.page === 'number' ? meta.page : page,
      limit: typeof meta.limit === 'number' ? meta.limit : limit,
      totalPages: typeof meta.totalPages === 'number' ? meta.totalPages : 0,
    },
  };
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
