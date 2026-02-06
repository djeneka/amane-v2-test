import { apiGet } from '@/lib/api';

/** Portefeuille embarqué dans une transaction */
export interface TransactionWallet {
  id: string;
  userId: string;
  balance: number;
}

/** Tiers (dédicace) dans metadata.donation */
export interface TransactionMetadataThirdParty {
  ribKey: string | null;
  lastName: string;
  firstName: string;
  dedicationType: string;
  personalMessage: string;
  relationshipType: string;
  certificateRecipient: string;
  showMyNameOnCertificate: boolean;
}

/** Don dans metadata */
export interface TransactionMetadataDonation {
  actor: string;
  thirdParty?: TransactionMetadataThirdParty;
}

/** Metadata optionnelle selon le type de transaction */
export type TransactionMetadata = {
  donation?: TransactionMetadataDonation;
} | null;

/** Transaction telle que renvoyée par GET /api/transactions/my-transactions */
export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  fee: number;
  type: 'DEBIT' | 'CREDIT';
  purpose: 'DONATION' | 'DEPOSIT' | 'TAKAFUL' | 'ZAKAT' | 'INVESTMENT';
  status: string;
  referenceId: string | null;
  transactionNumber: string;
  metadata: TransactionMetadata;
  createdAt: string;
  wallet: TransactionWallet;
}

const MY_TRANSACTIONS_URL = '/api/transactions/my-transactions';

/**
 * Récupère toutes les transactions de l'utilisateur connecté.
 * GET /api/transactions/my-transactions
 * @param accessToken - JWT (Bearer)
 * @returns Liste des transactions
 */
export async function getMyTransactions(accessToken: string): Promise<Transaction[]> {
  const list = await apiGet<Transaction[]>(MY_TRANSACTIONS_URL, { token: accessToken });
  return Array.isArray(list) ? list : [];
}
