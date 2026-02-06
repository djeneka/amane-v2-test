import { apiGet, apiPatch } from '@/lib/api';
import type { AuthUser } from '@/services/auth';

const ME_URL = '/api/users/me';

/**
 * Récupère les infos à jour de l'utilisateur connecté.
 * GET /api/users/me
 * @param accessToken - JWT renvoyé au login (Bearer)
 * @returns Utilisateur avec wallet et score à jour
 */
export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  return apiGet<AuthUser>(ME_URL, { token: accessToken });
}

const UPDATE_USER_URL = '/api/users/{id}';

/**
 * Met à jour les données du user connecté.
 * PATCH /api/users/{id}
 * @param id - ID de l'utilisateur
 * @param data - Champs à mettre à jour (name, email, phoneNumber, profilePicture, etc.)
 * @param accessToken - JWT Bearer
 */
export async function updateUser(
  id: string,
  data: Partial<Pick<AuthUser, 'name' | 'email' | 'phoneNumber' | 'profilePicture'>>,
  accessToken: string
): Promise<AuthUser> {
  return apiPatch<AuthUser>(UPDATE_USER_URL.replace('{id}', id), data, { token: accessToken });
}
