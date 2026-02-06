import CampaignDetailClient from './CampaignDetailClient';
import { getCampaignById } from '@/services/campaigns';
import { getDonationsStatistics } from '@/services/statistics';

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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #0d4d3d, #001a14)' }}>
        <div className="text-center text-white px-4">
          <h1 className="text-2xl font-bold mb-4">Campagne non trouvée</h1>
          <p className="text-white/80 mb-6">La campagne que vous recherchez n'existe pas ou a été supprimée.</p>
          <a href="/campagnes" className="text-green-400 hover:text-green-300 font-medium underline">
            Retour aux campagnes
          </a>
        </div>
      </div>
    );
  }

  const donorCount = stats.byCampaign.find((b) => b.campaignId === id)?.count ?? 0;

  return <CampaignDetailClient campaign={campaign} donorCount={donorCount} />;
} 