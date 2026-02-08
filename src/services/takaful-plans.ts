import { apiGet, apiPost } from '@/lib/api';

/** Créateur (createdBy) dans la réponse API */
export interface TakafulPlanCreatedBy {
  id: string;
  name: string;
  email: string;
}

/** Compteur (subscriptions) dans la réponse API */
export interface TakafulPlanCount {
  subscriptions: number;
}

/** Plan Takaful tel que renvoyé par l'API GET /api/takaful-plans */
export interface TakafulPlan {
  id: string;
  title: string;
  picture: string | null;
  description: string;
  monthlyContribution: number;
  categories: string[];
  benefits: string[];
  guarantees: string[];
  requiredDocuments: string[];
  whyChooseThis: string;
  status: string;
  startDate: string;
  endDate: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: TakafulPlanCreatedBy;
  _count: TakafulPlanCount;
}

const TAKAFUL_SUBSCRIPTIONS_URL = '/api/takaful';

/** Body pour souscrire à un plan Takaful. POST /api/takaful-subscriptions */
export interface AddTakafulBody {
  takafulPlanId: string;
  startDate: string; // ISO 8601 (ex. "2024-01-01T00:00:00Z")
  endDate: string;   // ISO 8601 (ex. "2024-12-31T23:59:59Z")
}

/** Souscription Takaful renvoyée par l'API après création */
export interface TakafulSubscription {
  id: string;
  takafulPlanId: string;
  userId: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Plan embarqué dans GET my-subscriptions */
export interface TakafulSubscriptionPlan {
  id: string;
  title: string;
  monthlyContribution: number;
  status: string;
}

/** Utilisateur embarqué dans GET my-subscriptions */
export interface TakafulSubscriptionUser {
  id: string;
  name: string;
  email: string;
}

/** Souscription telle que renvoyée par GET /api/takaful-subscriptions/my-subscriptions */
export interface MyTakafulSubscription {
  id: string;
  takafulPlanId: string;
  userId: string;
  status: string;
  startDate: string;
  endDate: string;
  nextPaymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  takafulPlan: TakafulSubscriptionPlan;
  user: TakafulSubscriptionUser;
  _count: { contributions: number };
}

/**
 * Récupère les souscriptions Takaful de l'utilisateur connecté.
 * GET /api/takaful-subscriptions/my-subscriptions
 * Header: Authorization: Bearer <accessToken>
 * @param accessToken - JWT (Bearer)
 * @returns Liste des souscriptions avec plan et user embarqués
 */
export async function getMyTakafulSubscriptions(accessToken: string): Promise<MyTakafulSubscription[]> {
  const list = await apiGet<MyTakafulSubscription[]>(
    `${TAKAFUL_SUBSCRIPTIONS_URL}-subscriptions/my-subscriptions`,
    { token: accessToken }
  );
  return Array.isArray(list) ? list : [];
}

/**
 * Souscrit l'utilisateur connecté à un plan Takaful.
 * POST /api/takaful-subscriptions
 * Header: Authorization: Bearer <accessToken>
 * @param accessToken - JWT (Bearer)
 * @param body - takafulPlanId, startDate, endDate (ISO 8601)
 * @returns La souscription créée
 * @throws Si le plan n'existe pas (404) ou autre erreur API
 */
export async function addTakaful(
  accessToken: string,
  body: AddTakafulBody
): Promise<TakafulSubscription> {
  return apiPost<TakafulSubscription>(`${TAKAFUL_SUBSCRIPTIONS_URL}-subscriptions`, body, { token: accessToken });
}

/** Body pour effectuer un paiement de cotisation Takaful (makeTakafulSubscriptions). Dates en ISO 8601. */
export interface MakeTakafulSubscriptionBody {
  walletCode: string;
  subscriptionId: string;
  amount: number;
  paymentDate: string;   // ISO 8601 (ex. "2026-02-08T00:00:00Z")
  nextPaymentDate: string; // ISO 8601 (ex. "2026-03-08T00:00:00Z")
}

/** Souscription embarquée dans la réponse d'une contribution */
export interface TakafulContributionSubscription {
  id: string;
  takafulPlanId: string;
  userId: string;
  status: string;
  startDate: string;
  endDate: string;
  nextPaymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  takafulPlan: { id: string; title: string; monthlyContribution: number };
}

/** Contribution (paiement) Takaful renvoyée par makeTakafulSubscriptions */
export interface TakafulContribution {
  id: string;
  transactionId: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  nextPaymentDate: string;
  createdAt: string;
  updatedAt: string;
  subscription: TakafulContributionSubscription;
  user: TakafulSubscriptionUser;
}

/**
 * Effectue un paiement de cotisation pour une souscription Takaful.
 * POST /api/takaful-subscriptions/contributions
 * Header: Authorization: Bearer <accessToken>
 * @param accessToken - JWT (Bearer)
 * @param body - walletCode, subscriptionId, amount, paymentDate, nextPaymentDate (ISO 8601)
 * @returns La contribution créée (transactionId, subscription, user, etc.)
 * @throws Si validation échoue (ex. nextPaymentDate invalide) ou autre erreur API
 */
export async function makeTakafulSubscriptions(
  accessToken: string,
  body: MakeTakafulSubscriptionBody
): Promise<TakafulContribution> {
  return apiPost<TakafulContribution>(
    `${TAKAFUL_SUBSCRIPTIONS_URL}-contributions`,
    body,
    { token: accessToken }
  );
}

/**
 * Récupère la liste des plans Takaful actifs depuis l'API.
 * GET /api/takaful-plans?status=ACTIVE
 * Ne retourne que les plans avec status ACTIVE.
 */
export async function getTakafulPlans(): Promise<TakafulPlan[]> {
  const list = await apiGet<TakafulPlan[]>('/api/takaful-plans?status=ACTIVE');
  return (Array.isArray(list) ? list : []).filter((plan) => plan.status === 'ACTIVE');
}

/**
 * Récupère un plan Takaful par son id.
 * GET /api/takaful-plans/:id
 * Retourne null si le plan n'existe pas (ex. 404).
 */
export async function getTakafulPlanById(id: string): Promise<TakafulPlan | null> {
  try {
    const plan = await apiGet<TakafulPlan>(`/api/takaful-plans/${id}`);
    return plan ?? null;
  } catch {
    return null;
  }
}
