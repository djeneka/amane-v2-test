import { apiPost } from '@/lib/api';

/** Corps de la requête POST /api/mail/contact */
export interface ContactMailBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Réponse de l'API mail contact */
export interface ContactMailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Envoie un message de contact via l'API mail.
 * POST {NEXT_PUBLIC_API_URL}/api/mail/contact
 * @param body - name, email, subject, message
 * @returns Réponse avec success, message et optionnellement messageId
 */
export async function sendContactEmail(body: ContactMailBody): Promise<ContactMailResponse> {
  return apiPost<ContactMailResponse>('/api/mail/contact', body);
}
