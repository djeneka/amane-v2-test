import { apiPost } from '@/lib/api';

/** Portefeuille utilisateur (réponse API) */
export interface AuthWallet {
  id: string;
  balance: number;
  currency: string;
}

/** Score utilisateur (réponse API) */
export interface AuthScore {
  score: number;
}

/** Utilisateur tel que renvoyé par l'API auth */
export interface AuthUser {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  profilePicture: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  wallet: AuthWallet;
  score: AuthScore;
}

/** Réponse POST /api/auth/login */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Corps de requête : connexion par email OU par numéro de téléphone */
export type LoginCredentials =
  | { email: string; password: string }
  | { phoneNumber: string; password: string };

const LOGIN_URL = '/api/auth/login';
const FORGOT_PASSWORD_URL = '/api/auth/forgot-password';

/** Corps de requête : demande de reset mot de passe (email OU phoneNumber) */
export type ForgotPasswordBody = { email: string } | { phoneNumber: string };

/** Réponse POST /api/auth/forgot-password */
export interface ForgotPasswordResponse {
  message: string;
  otp: string;
}

/**
 * Demande de réinitialisation du mot de passe.
 * POST /api/auth/forgot-password
 * @param body - { email } ou { phoneNumber }
 * @returns message et code OTP (envoyé par email/SMS)
 */
export async function forgotPassword(body: ForgotPasswordBody): Promise<ForgotPasswordResponse> {
  return apiPost<ForgotPasswordResponse>(FORGOT_PASSWORD_URL, body);
}

const RESEND_OTP_URL = '/api/auth/resend-otp';

/** Réponse POST /api/auth/resend-otp */
export interface ResendOtpResponse {
  message: string;
}

/**
 * Renvoie un code OTP (après forgot-password).
 * POST /api/auth/resend-otp
 * @param body - { email } ou { phoneNumber }
 * @returns message de confirmation
 */
export async function resendOtp(body: ForgotPasswordBody): Promise<ResendOtpResponse> {
  return apiPost<ResendOtpResponse>(RESEND_OTP_URL, body);
}

const RESET_PASSWORD_URL = '/api/auth/forgot-password/reset';

/** Corps de requête : reset mot de passe après OTP (forgot-password) */
export interface ResetPasswordBody {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

/** Réponse succès POST /api/auth/forgot-password/reset */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * Réinitialise le mot de passe avec le code OTP reçu (flux forgot-password).
 * POST /api/auth/forgot-password/reset
 * @param body - otp, newPassword, confirmPassword
 * @throws Error avec message API en cas d'échec
 */
export async function resetPassword(body: ResetPasswordBody): Promise<ResetPasswordResponse> {
  try {
    return await apiPost<ResetPasswordResponse>(RESET_PASSWORD_URL, body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      const data = JSON.parse(message) as { message?: string; error?: string };
      throw new Error(data.message ?? data.error ?? message);
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) throw err;
      throw parseErr;
    }
  }
}

/**
 * Connexion avec email ou numéro de téléphone.
 * POST /api/auth/login
 * @param credentials - { email, password } ou { phoneNumber, password }
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiPost<LoginResponse>(LOGIN_URL, credentials);
}

const CHANGE_PASSWORD_URL = '/api/auth/change-password';

/** Corps de requête : changement de mot de passe */
export interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Réponse succès POST /api/auth/change-password */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Modifie le mot de passe de l'utilisateur connecté.
 * POST /api/auth/change-password
 * @param body - oldPassword, newPassword, confirmPassword
 * @param accessToken - JWT Bearer
 * @throws Error avec message API en cas d'échec (ex. "Ancien mot de passe incorrect")
 */
export async function changePassword(
  body: ChangePasswordBody,
  accessToken: string
): Promise<ChangePasswordResponse> {
  try {
    return await apiPost<ChangePasswordResponse>(CHANGE_PASSWORD_URL, body, { token: accessToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      const data = JSON.parse(message) as { message?: string; error?: string };
      throw new Error(data.message ?? data.error ?? message);
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) throw err;
      throw parseErr;
    }
  }
}
