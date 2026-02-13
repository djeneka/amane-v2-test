import { apiGet } from '@/lib/api';

/** Seuil de nissab retourné par l'API */
export interface NissabThreshold {
  id: string;
  year: number;
  amount: number;
  country: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/** Filtres optionnels pour la requête (tous peuvent être vides) */
export interface NissabFilters {
  year?: number;
  country?: string;
  currency?: string;
}

const NISSAB_THRESHOLDS_PATH = '/api/nissab-thresholds';

/**
 * Construit l'URL avec les paramètres de requête (uniquement les filtres non vides).
 */
function buildNissabUrl(filters?: NissabFilters): string {
  if (!filters) return NISSAB_THRESHOLDS_PATH;
  const params = new URLSearchParams();
  if (filters.year != null && String(filters.year).trim() !== '') {
    params.set('year', String(filters.year));
  }
  if (filters.country != null && String(filters.country).trim() !== '') {
    params.set('country', filters.country.trim());
  }
  if (filters.currency != null && String(filters.currency).trim() !== '') {
    params.set('currency', filters.currency.trim());
  }
  const query = params.toString();
  return query ? `${NISSAB_THRESHOLDS_PATH}?${query}` : NISSAB_THRESHOLDS_PATH;
}

/**
 * Récupère les seuils de nissab.
 * GET /api/nissab-thresholds
 * @param filters - Filtres optionnels (year, country, currency) ; peuvent être vides ou omis
 * @param accessToken - JWT (Bearer), optionnel si l'endpoint est public
 * @returns Liste des NissabThreshold
 */
export async function getNissabThresholds(
  filters?: NissabFilters,
  accessToken?: string
): Promise<NissabThreshold[]> {
  const url = buildNissabUrl(filters);
  return apiGet<NissabThreshold[]>(url, accessToken ? { token: accessToken } : undefined);
}

/**
 * Récupère le seuil de nissab pour un pays donné.
 * GET /api/nissab-thresholds/:country
 * @param country - Nom du pays (ex. "Côte d'ivoire"), encodé automatiquement dans l'URL
 * @param accessToken - JWT (Bearer), optionnel si l'endpoint est public
 * @returns Le NissabThreshold du pays
 */
export async function getNissabByCountry(
  country: string,
  accessToken?: string
): Promise<NissabThreshold> {
  const encoded = encodeURIComponent(country.trim());
  return apiGet<NissabThreshold>(`${NISSAB_THRESHOLDS_PATH}/${encoded}`, accessToken ? { token: accessToken } : undefined);
}
