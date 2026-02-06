import { apiGet } from '@/lib/api';

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
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  user: ZakatUser;
  _count: {
    payments: number;
  };
}

const MY_ZAKATS_URL = '/api/zakats/my-zakats';

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
