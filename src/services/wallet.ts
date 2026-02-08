import { apiPost, apiPatch } from '@/lib/api';

/**
 * Change le code wallet de l'utilisateur.
 * PATCH /api/wallet/code
 * Body: { oldCode, newCode, confirmNewCode }
 */
export async function changeWalletCode(
  accessToken: string,
  body: { oldCode: string; newCode: string; confirmNewCode: string }
): Promise<{ success: boolean; message?: string }> {
  const data = await apiPatch<{ message?: string }>(
    '/api/wallet/code',
    body,
    { token: accessToken }
  );
  return { success: true, message: data?.message };
}

/**
 * Demande une réinitialisation du code wallet (envoi OTP par email).
 * POST /api/wallet/code/forgot
 * Body: vide
 * Réponse: { message, otp? } (otp peut être renvoyé en dev)
 */
export async function requestResetWalletCode(accessToken: string): Promise<{ success: boolean; message?: string; otp?: string }> {
  const data = await apiPost<{ message?: string; otp?: string }>(
    '/api/wallet/code/forgot',
    {},
    { token: accessToken }
  );
  return { success: true, message: data?.message, otp: data?.otp };
}

/**
 * Réinitialise le code wallet avec l'OTP reçu par email.
 * POST /api/wallet/code/reset
 * Body: { otp, newCode, confirmNewCode }
 */
export async function resetWalletCode(
  accessToken: string,
  body: { otp: string; newCode: string; confirmNewCode: string }
): Promise<{ success: boolean; message?: string }> {
  const data = await apiPost<{ message?: string }>(
    '/api/wallet/code/reset',
    body,
    { token: accessToken }
  );
  return { success: true, message: data?.message };
}
