import { apiPost } from '@/lib/api';

/** Body pour initier un paiement direct */
export interface InitiatePaymentBody {
  amount: number;
  serviceCode: string;
  phoneNumber: string;
  /** Requis uniquement pour serviceCode "om", peut être vide sinon */
  otp?: string;
}

/** Données internes du provider (moov, wave, etc.) */
export interface InitiatePaymentProviderData {
  idFromClient: string;
  idFromGU: string;
  amount: number;
  fees: number;
  serviceCode: string;
  recipientNumber: string;
  dateTime: number;
  status: string;
  numTransaction: string;
  /** Présent pour wave (et autres paiements avec redirection) */
  payment_url?: string;
}

/** Enveloppe data du retour API */
export interface InitiatePaymentDataInner {
  success: boolean;
  message: string;
  data: InitiatePaymentProviderData;
  transactionNumber: string;
}

/** Data au premier niveau du retour */
export interface InitiatePaymentData {
  transactionNumber: string;
  amount: number;
  data: InitiatePaymentDataInner;
  provider: string;
  status: string;
}

/** Réponse complète POST /api/transactions/payment/direct/initiate */
export interface InitiatePaymentResponse {
  responseStatus: number;
  data: InitiatePaymentData;
  responseMessage: string;
}

const INITIATE_PAYMENT_URL = '/api/transactions/payment/direct/initiate';

/**
 * Initie un paiement direct (moov, wave, om, etc.).
 * POST /api/transactions/payment/direct/initiate
 * @param body - amount, serviceCode, phoneNumber, otp (obligatoire seulement pour serviceCode "om")
 * @param accessToken - JWT (Bearer)
 * @returns Réponse avec transactionNumber, status, et selon le provider : data.data.payment_url (ex. wave)
 */
export async function initiatePayment(
  body: InitiatePaymentBody,
  accessToken: string
): Promise<InitiatePaymentResponse> {
  const payload = {
    amount: body.amount,
    serviceCode: body.serviceCode,
    phoneNumber: body.phoneNumber,
    otp: body.otp ?? '',
  };
  return apiPost<InitiatePaymentResponse>(INITIATE_PAYMENT_URL, payload, { token: accessToken });
}

// --- Check status ---

/** Body pour vérifier le statut d'un paiement direct */
export interface CheckPaymentStatusBody {
  transactionNumber: string;
}

/** Données de statut renvoyées par le provider (data ou error) */
export interface PaymentStatusProviderData {
  idFromClient: string;
  idFromGU: string;
  amount: number;
  fees: number;
  serviceCode: string;
  recipientNumber: string;
  dateTime: number;
  status: string;
}

/** Entrée par provider dans data (ex. amane) */
export interface PaymentStatusProviderEntry {
  success: boolean;
  status: string;
  data: PaymentStatusProviderData;
  error?: PaymentStatusProviderData;
}

/** Réponse POST /api/transactions/payment/direct/status */
export interface CheckPaymentStatusResponse {
  responseStatus: number;
  success: boolean;
  data: Record<string, PaymentStatusProviderEntry>;
  message: string;
}

const CHECK_PAYMENT_STATUS_URL = '/api/transactions/payment/direct/status';

/**
 * Vérifie le statut d'un paiement direct.
 * POST /api/transactions/payment/direct/status
 * @param body - transactionNumber (ex. PI.2026.02.25397.UCGIN)
 * @param accessToken - JWT (Bearer)
 * @returns Statut par provider (ex. data.amane.status, data.amane.success)
 */
export async function checkPaymentStatus(
  body: CheckPaymentStatusBody,
  accessToken: string
): Promise<CheckPaymentStatusResponse> {
  return apiPost<CheckPaymentStatusResponse>(CHECK_PAYMENT_STATUS_URL, body, { token: accessToken });
}

// --- Confirm top-up (créditer le compte) ---

/** Body pour confirmer une recharge et créditer le compte */
export interface ConfirmTopUpBody {
  transactionNumber: string;
  amount: number;
}

/** Transaction créée après confirmation */
export interface ConfirmTopUpTransaction {
  id: string;
  transactionNumber: string;
  amount: number;
  type: string;
  purpose: string;
  status: string;
  createdAt: string;
}

/** Portefeuille mis à jour */
export interface ConfirmTopUpWallet {
  balance: number;
  currency: string;
}

/** Réponse POST /api/transactions/payment/direct/top-up/confirm */
export interface ConfirmTopUpResponse {
  responseStatus: number;
  success: boolean;
  data: {
    transaction: ConfirmTopUpTransaction;
    wallet: ConfirmTopUpWallet;
  };
  responseMessage: string;
}

const CONFIRM_TOP_UP_URL = '/api/transactions/payment/direct/top-up/confirm';

/**
 * Confirme une recharge et crédite le compte du user.
 * POST /api/transactions/payment/direct/top-up/confirm
 * @param body - transactionNumber (ex. PI.2026.02.60472.RODPQ), amount
 * @param accessToken - JWT (Bearer)
 * @returns Transaction créée et nouveau solde du wallet
 */
export async function confirmTopUp(
  body: ConfirmTopUpBody,
  accessToken: string
): Promise<ConfirmTopUpResponse> {
  return apiPost<ConfirmTopUpResponse>(CONFIRM_TOP_UP_URL, body, { token: accessToken });
}
