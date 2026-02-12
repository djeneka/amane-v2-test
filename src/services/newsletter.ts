import { apiPost } from '@/lib/api';

/** Body pour s'inscrire à la newsletter. POST /api/newsletter */
export interface NewsletterSubscribeBody {
  email: string;
  phoneNumber: string;
  name: string;
}

/** Réponse API après création d'un abonnement newsletter */
export interface NewsletterSubscription {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const NEWSLETTER_URL = '/api/newsletter';

/**
 * Inscrit un contact à la newsletter (liste d'attente).
 * POST /api/newsletter
 */
export async function subscribeNewsletter(
  body: NewsletterSubscribeBody
): Promise<NewsletterSubscription> {
  return apiPost<NewsletterSubscription>(NEWSLETTER_URL, body);
}
