import { apiGet } from '@/lib/api';

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
  personalMessage: string;
  showMyNameOnCertificate: boolean;
  certificateRecipient: string;
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

/**
 * Récupère la liste des dons de l'utilisateur connecté.
 * GET /api/donations
 * @param accessToken - JWT (Bearer)
 * @returns Liste des dons avec campagne et tiers optionnels
 */
export async function getMyDonations(accessToken: string): Promise<Donation[]> {
  const list = await apiGet<Donation[]>(DONATIONS_URL, { token: accessToken });
  return Array.isArray(list) ? list : [];
}
