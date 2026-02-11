import { apiGet, apiPost } from '@/lib/api';

/** Campagne embarquée dans une donation */
export interface DonationCampaign {
  id: string;
  title: string;
  status: string;
  currentAmount: number;
  targetAmount: number;
}

/** Utilisateur embarqué dans une donation */
export interface DonationUser {
  id: string;
  name: string;
  email: string;
}

/** Don au nom d'un tiers (dédicace) */
export interface DonationThirdParty {
  id: string;
  dedicationType: string;
  firstName: string;
  lastName: string;
  relationshipType: string;
  personalMessage?: string;
  showMyNameOnCertificate: boolean;
  certificateRecipient: string;
  certificatUrl: string | null;
  ribKey: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Don tel que renvoyé par GET /api/donations */
export interface Donation {
  id: string;
  transactionId: string;
  campaignId: string | null;
  userId: string;
  actor: 'SELF' | 'THIRD_PARTY';
  thirdPartyId: string | null;
  createdAt: string;
  /** Montant du don (currentAmount du don, si renvoyé par l'API) */
  currentAmount?: number;
  amount?: number;
  thirdParty: DonationThirdParty | null;
  campaign: DonationCampaign | null;
  user: DonationUser;
}

const DONATIONS_URL = '/api/donations';
const DONATIONS_GENERAL_URL = '/api/donations/general';

/** Tiers pour un don au nom d'une personne (body POST). dedicationType = valeurs API. */
export interface CreateDonationThirdPartyInput {
  dedicationType: 'LIVING' | 'IN_MEMORY' | 'IN_HONOR_OF';
  firstName: string;
  lastName: string;
  relationshipType: string;
  personalMessage: string;
  showMyNameOnCertificate: boolean;
  certificateRecipient: 'SELF' | 'HONOREE' | 'SELF_AND_HONOREE';
  certificatUrl?: string;
  ribKey?: string;
}

/** Body pour créer un don à son propre nom (actor = SELF, pas de thirdParty) */
export interface CreateDonationSelfBody {
  walletCode: string;
  actor: 'SELF';
  campaignId: string;
  amount: number;
  purpose: 'DONATION';
}

/** Body pour créer un don au nom d'une personne (actor = THIRD_PARTY) */
export interface CreateDonationThirdPartyBody {
  walletCode: string;
  actor: 'THIRD_PARTY';
  thirdParty: CreateDonationThirdPartyInput;
  campaignId: string;
  amount: number;
  purpose: 'DONATION';
}

export type CreateDonationBody = CreateDonationSelfBody | CreateDonationThirdPartyBody;

/** Body pour un don général à son propre nom (sans campagne) */
export interface CreateGeneralDonationSelfBody {
  walletCode: string;
  actor: 'SELF';
  amount: number;
  purpose: 'DONATION';
}

/** Body pour un don général au nom d'une personne (sans campagne) */
export interface CreateGeneralDonationThirdPartyBody {
  walletCode: string;
  actor: 'THIRD_PARTY';
  thirdParty: CreateDonationThirdPartyInput;
  amount: number;
  purpose: 'DONATION';
}

export type CreateGeneralDonationBody = CreateGeneralDonationSelfBody | CreateGeneralDonationThirdPartyBody;

/**
 * Récupère la liste des dons de l'utilisateur connecté.
 * GET /api/donations
 * Header: Authorization: Bearer <accessToken>
 * @param accessToken - JWT (Bearer)
 * @returns Liste des dons (id, transactionId, campaignId, actor, thirdParty, campaign, user, createdAt)
 */
export async function getMyDonations(accessToken: string): Promise<Donation[]> {
  const list = await apiGet<Donation[]>(DONATIONS_URL, { token: accessToken });
  return Array.isArray(list) ? list : [];
}

/**
 * Crée un don sur une campagne.
 * POST /api/donations
 * À son nom : actor = SELF, pas de thirdParty (clé omise pour éviter l'erreur backend).
 * Au nom d'une personne : actor = THIRD_PARTY, thirdParty = { dedicationType, firstName, lastName, ... }.
 * @param accessToken - JWT (Bearer)
 * @param body - walletCode, actor (SELF | THIRD_PARTY), campaignId, amount, purpose ; thirdParty si actor = THIRD_PARTY
 * @returns La donation créée (id, transactionId, campaign, user, thirdParty si applicable)
 */
export async function createDonation(
  accessToken: string,
  body: CreateDonationBody
): Promise<Donation> {
  const payload =
    body.actor === 'SELF'
      ? {
          walletCode: body.walletCode,
          actor: 'SELF' as const,
          campaignId: body.campaignId,
          amount: body.amount,
          purpose: 'DONATION' as const,
        }
      : {
          walletCode: body.walletCode,
          actor: 'THIRD_PARTY' as const,
          thirdParty: body.thirdParty,
          campaignId: body.campaignId,
          amount: body.amount,
          purpose: 'DONATION' as const,
        };
  return apiPost<Donation>(DONATIONS_URL, payload, { token: accessToken });
}

/**
 * Crée un don général (sans campagne).
 * POST /api/donations/general
 * Même principe que createDonation mais sans campaignId dans le body.
 * À son nom : actor = SELF. Au nom d'une personne : actor = THIRD_PARTY + thirdParty.
 * @param accessToken - JWT (Bearer)
 * @param body - walletCode, actor (SELF | THIRD_PARTY), amount, purpose ; thirdParty si actor = THIRD_PARTY
 * @returns La donation créée
 */
export async function makeGeneralDonation(
  accessToken: string,
  body: CreateGeneralDonationBody
): Promise<Donation> {
  const payload =
    body.actor === 'SELF'
      ? {
          walletCode: body.walletCode,
          actor: 'SELF' as const,
          amount: body.amount,
          purpose: 'DONATION' as const,
        }
      : {
          walletCode: body.walletCode,
          actor: 'THIRD_PARTY' as const,
          thirdParty: body.thirdParty,
          amount: body.amount,
          purpose: 'DONATION' as const,
        };
  return apiPost<Donation>(DONATIONS_GENERAL_URL, payload, { token: accessToken });
}
