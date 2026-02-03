import { apiGet } from '@/lib/api';

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
