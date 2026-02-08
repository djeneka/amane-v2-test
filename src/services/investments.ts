import { apiGet, apiPost } from '@/lib/api';

/** Créateur (createdBy) dans la réponse API */
export interface InvestmentProductCreatedBy {
  id: string;
  name: string;
  email: string;
}

/** Compteur (subscriptions) dans la réponse API */
export interface InvestmentProductCount {
  subscriptions: number;
}

/** Produit d'investissement tel que renvoyé par l'API GET /api/investment-products */
export interface InvestmentProduct {
  id: string;
  title: string;
  picture: string;
  description: string;
  partner: string;
  minimumAmount: number;
  estimatedReturn: string;
  duration: number;
  benefits: string[];
  riskLevel: string[];
  category: string[];
  whyChooseThis: string;
  status: string;
  startDate: string;
  endDate: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: InvestmentProductCreatedBy;
  _count: InvestmentProductCount;
}

/**
 * Récupère la liste des produits d'investissement depuis l'API.
 * GET /api/investment-products?status=ACTIVE (ou autre status)
 * @param status - Filtre par statut (défaut: ACTIVE)
 */
export async function getInvestmentProducts(
  status: string = 'ACTIVE'
): Promise<InvestmentProduct[]> {
  const list = await apiGet<InvestmentProduct[]>(
    `/api/investment-products?status=${encodeURIComponent(status)}`
  );
  return Array.isArray(list) ? list : [];
}

const INVESTMENT_SUBSCRIPTIONS_URL = '/api/investment';
const INVESTMENT_CONTRIBUTIONS_URL = '/api/investments';
const MY_INVESTMENTS_URL = '/api/investments/my-investments';

/** Produit embarqué dans my-investments */
export interface MyInvestmentProductEmbed {
  id: string;
  title: string;
  estimatedReturn: string;
  duration: number;
}

/** Utilisateur embarqué dans my-investments */
export interface MyInvestmentUserEmbed {
  id: string;
  name: string;
  email: string;
}

/** Souscription embarquée dans un investissement */
export interface MyInvestmentSubscriptionEmbed {
  id: string;
  investmentProductId: string;
  userId: string;
  status: string;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
  investmentProduct: MyInvestmentProductEmbed;
  user: MyInvestmentUserEmbed;
}

/** Investissement tel que renvoyé par GET /api/investments/my-investments */
export interface MyInvestment {
  id: string;
  transactionId: string;
  investmentSubscriptionId: string;
  amount: number;
  investmentDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  investmentSubscription: MyInvestmentSubscriptionEmbed;
}

/**
 * Récupère la liste des investissements de l'utilisateur connecté.
 * GET /api/investments/my-investments
 * Header: Authorization: Bearer <accessToken>
 */
export async function getMyInvestments(accessToken: string): Promise<MyInvestment[]> {
  const list = await apiGet<MyInvestment[]>(MY_INVESTMENTS_URL, { token: accessToken });
  return Array.isArray(list) ? list : [];
}

/** Body pour ajouter une souscription investissement. POST /api/investment-subscriptions */
export interface AddInvestmentBody {
  investmentProductId: string;
}

/** Souscription investissement renvoyée par l'API après création */
export interface InvestmentSubscription {
  id: string;
  investmentProductId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body pour effectuer un paiement de souscription investissement. */
export interface MakeInvestmentSubscriptionBody {
  walletCode: string;
  investmentSubscriptionId: string;
  amount: number;
  investmentDate: string; // ISO 8601 (ex. "2024-01-15T00:00:00Z")
}

/** Réponse de makeInvestmentSubscription */
export interface InvestmentContribution {
  id: string;
  transactionId: string;
  investmentSubscriptionId: string;
  userId: string;
  amount: number;
  investmentDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ajoute une souscription investissement (étape 1 du modal).
 * POST /api/investment-subscriptions
 * @param accessToken - JWT (Bearer)
 * @param body - investmentProductId
 * @returns La souscription créée (contient id = investmentSubscriptionId)
 */
export async function addInvestment(
  accessToken: string,
  body: AddInvestmentBody
): Promise<InvestmentSubscription> {
  return apiPost<InvestmentSubscription>(`${INVESTMENT_SUBSCRIPTIONS_URL}-subscriptions`, body, { token: accessToken });
}

/**
 * Effectue le paiement de la souscription investissement.
 * POST /api/investment-subscriptions/contributions (ou chemin API à confirmer)
 * @param accessToken - JWT (Bearer)
 * @param body - walletCode, investmentSubscriptionId, amount, investmentDate (ISO 8601)
 */
export async function makeInvestmentSubscription(
  accessToken: string,
  body: MakeInvestmentSubscriptionBody
): Promise<InvestmentContribution> {
  return apiPost<InvestmentContribution>(
    `${INVESTMENT_CONTRIBUTIONS_URL}`,
    body,
    { token: accessToken }
  );
}

/**
 * Récupère un produit d'investissement par son id.
 * GET /api/investment-products/:id
 * Retourne null si le produit n'existe pas (ex. 404).
 */
export async function getInvestmentProductById(
  id: string
): Promise<InvestmentProduct | null> {
  try {
    const product = await apiGet<InvestmentProduct>(`/api/investment-products/${id}`);
    return product ?? null;
  } catch {
    return null;
  }
}

/** Catégorie affichée (slug) utilisée par l'UI */
export type InvestmentCategorySlug = 'immobilier' | 'agriculture' | 'technologie' | 'energie';

/** Niveau de risque affiché */
export type InvestmentRiskSlug = 'faible' | 'modere' | 'eleve';

/** Produit mappé pour l'affichage (liste et détail) */
export interface InvestmentProductDisplay {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  riskLevel: InvestmentRiskSlug;
  minInvestment: number;
  duration: string;
  /** Catégorie principale (slug) pour badge / icône / fallback image */
  category: InvestmentCategorySlug;
  /** Catégories brutes de l'API (ex. REAL_ESTATE, ETHICAL) pour le filtre */
  categories: string[];
  picture?: string;
  benefits?: string[];
  whyChooseThis?: string;
  partner?: string;
  createdAt?: string;
}

/** Libellés d'affichage pour les catégories API (utilisés dans le filtre) */
export const API_CATEGORY_LABELS: Record<string, string> = {
  REAL_ESTATE: 'Immobilier',
  AGRICULTURE: 'Agriculture',
  ETHICAL: 'Éthique',
  TECHNOLOGY: 'Technologie',
  TECH: 'Technologie',
  ENERGY: 'Énergie',
};

/** Mapping catégorie API → slug (pour icône / couleur dans l’UI) */
export const API_CATEGORY_TO_SLUG: Record<string, InvestmentCategorySlug> = {
  REAL_ESTATE: 'immobilier',
  AGRICULTURE: 'agriculture',
  ETHICAL: 'agriculture',
  TECHNOLOGY: 'technologie',
  TECH: 'technologie',
  ENERGY: 'energie',
};

const API_RISK_TO_SLUG: Record<string, InvestmentRiskSlug> = {
  LOW: 'faible',
  MEDIUM: 'modere',
  HIGH: 'eleve',
};

/**
 * Convertit un produit API en format d'affichage pour l'UI.
 */
export function mapInvestmentToDisplay(api: InvestmentProduct): InvestmentProductDisplay {
  const rawCategories = (api.category ?? []).map((c) => String(c).toUpperCase().trim()).filter(Boolean);
  const categoryKey = rawCategories[0] ?? '';
  const riskKey = api.riskLevel?.[0]?.toUpperCase() ?? 'MEDIUM';
  return {
    id: api.id,
    name: api.title,
    description: api.description,
    expectedReturn: parseFloat(api.estimatedReturn) || 0,
    riskLevel: API_RISK_TO_SLUG[riskKey] ?? 'modere',
    minInvestment: api.minimumAmount,
    duration: api.duration ? `${api.duration} mois` : '–',
    category: API_CATEGORY_TO_SLUG[categoryKey] ?? 'immobilier',
    categories: rawCategories.length > 0 ? rawCategories : ['REAL_ESTATE'],
    picture: api.picture || undefined,
    benefits: api.benefits,
    whyChooseThis: api.whyChooseThis,
    partner: api.partner,
    createdAt: api.createdAt,
  };
}
