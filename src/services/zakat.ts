import { apiDelete, apiGet, apiPost } from '@/lib/api';

/** Utilisateur embarqué dans une zakat */
export interface ZakatUser {
  id: string;
  name: string;
  email: string;
}

/** Zakat telle que renvoyée par GET /api/zakats/my-zakats */
export interface Zakat {
  id: string;
  userId: string;
  calculationDate: string;
  year: number;
  totalAmount: number;
  /** Zakat due à la création (ne change pas) */
  zakatDue?: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  user: ZakatUser;
  _count: {
    payments: number;
  };
}

/** Zakat embarquée dans une contribution (réponse payZakat) */
export interface ZakatContributionZakat {
  id: string;
  year: number;
  totalAmount: number;
  remainingAmount: number;
}

/** Réponse POST /api/zakat-contributions (paiement zakat) */
export interface ZakatContribution {
  id: string;
  transactionId: string;
  zakatId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  zakat: ZakatContributionZakat;
  user: ZakatUser;
}

const MY_ZAKATS_URL = '/api/zakats/my-zakats';
const ZAKATS_URL = '/api/zakats';
const ZAKAT_CONTRIBUTIONS_URL = '/api/zakat-contributions';

/** Clé sessionStorage pour une zakat en attente (sauvegarde après connexion/inscription) */
export const PENDING_ZAKAT_STORAGE_KEY = 'amane-pending-zakat';

/** Corps de la requête POST /api/zakats (création d'une zakat) */
export interface CreateZakatBody {
  calculationDate: string;
  year: number;
  totalAmount: number;
  /** Zakat due à la création (agriculture = 10%/5%/7,5%, reste = 2,5%) — ne change pas */
  zakatDue: number;
  /** Montant restant à payer — initialement = zakatDue, diminue à chaque paiement */
  remainingAmount: number;
}

/** Corps de la requête POST /api/zakat-contributions (paiement zakat) */
export interface PayZakatBody {
  walletCode: string;
  zakatId: string;
  amount: number;
  paymentDate: string; // ISO 8601, ex. "2026-02-07T00:00:00Z"
}

/**
 * Récupère toutes les zakats de l'utilisateur connecté.
 * GET /api/zakats/my-zakats
 * @param accessToken - JWT (Bearer)
 * @returns Liste des zakats
 */
export async function getMyZakats(accessToken: string): Promise<Zakat[]> {
  const list = await apiGet<Zakat[]>(MY_ZAKATS_URL, { token: accessToken });
  return Array.isArray(list) ? list : [];
}

/**
 * Crée une zakat pour l'utilisateur connecté.
 * POST /api/zakats
 * @param accessToken - JWT (Bearer)
 * @param body - calculationDate (ISO string), year, totalAmount
 * @returns La zakat créée
 */
export async function createZakat(
  accessToken: string,
  body: CreateZakatBody
): Promise<Zakat> {
  return apiPost<Zakat>(ZAKATS_URL, body, { token: accessToken });
}

/**
 * Supprime une zakat.
 * DELETE /api/zakats/:id
 * @param accessToken - JWT (Bearer)
 * @param zakatId - ID de la zakat à supprimer
 */
export async function deleteZakat(
  accessToken: string,
  zakatId: string
): Promise<void> {
  await apiDelete(`${ZAKATS_URL}/${zakatId}`, { token: accessToken });
}

/**
 * Paye une zakat (contribution).
 * POST /api/zakat-contributions
 * @param accessToken - JWT (Bearer)
 * @param body - walletCode, zakatId, amount, paymentDate (ISO string)
 * @returns La contribution créée (contribution + zakat + user)
 * @throws Error avec message du backend en cas d'échec (ex. "Code du wallet incorrect" → 401)
 */
export async function payZakat(
  accessToken: string,
  body: PayZakatBody
): Promise<ZakatContribution> {
  return apiPost<ZakatContribution>(ZAKAT_CONTRIBUTIONS_URL, body, {
    token: accessToken,
  });
}


