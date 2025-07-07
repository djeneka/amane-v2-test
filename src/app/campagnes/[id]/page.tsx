import { campaigns } from '@/data/mockData';
import CampaignDetailClient from './CampaignDetailClient';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;

  const campaign = campaigns.find(c => c.id === id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campagne non trouvée</h1>
          <p className="text-gray-600">La campagne que vous recherchez n'existe pas.</p>
        </div>
      </div>
    );
  }

  return <CampaignDetailClient campaign={campaign} />;
} 