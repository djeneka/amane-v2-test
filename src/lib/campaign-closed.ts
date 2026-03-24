import type { Campaign } from '@/data/mockData';

/**
 * Campagne considérée comme clôturée pour le don / la zakat :
 * objectif atteint OU statut API CLOSED (mappé en `closed` côté front).
 */
export function isCampaignDonationClosed(
  c: Pick<Campaign, 'targetAmount' | 'currentAmount' | 'status'>
): boolean {
  const target = c.targetAmount ?? 0;
  const current = c.currentAmount ?? 0;
  const targetReached = target > 0 && current >= target;
  return targetReached || c.status === 'closed';
}
