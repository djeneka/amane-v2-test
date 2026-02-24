import CampaignDetailClient from './CampaignDetailClient';
import CampaignNotFoundBlock from './CampaignNotFoundBlock';
import { getCampaignById } from '@/services/campaigns';
import { getDonationsStatistics } from '@/services/statistics';

/** Désactive le cache pour toujours afficher les données à jour de la campagne */
export const dynamic = 'force-dynamic';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;

  const [campaign, stats] = await Promise.all([
    getCampaignById(id),
    getDonationsStatistics().catch(() => ({ byCampaign: [] as { campaignId: string; count: number }[] })),
  ]);

  if (!campaign) {
    return <CampaignNotFoundBlock />;
  }

  const donorCount = stats.byCampaign.find((b) => b.campaignId === id)?.count ?? 0;

  return <CampaignDetailClient campaign={campaign} donorCount={donorCount} />;
} 