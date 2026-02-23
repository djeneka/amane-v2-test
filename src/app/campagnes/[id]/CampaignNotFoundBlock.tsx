'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CampaignNotFoundBlock() {
  const t = useTranslations('campagnes');
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #0d4d3d, #001a14)' }}>
      <div className="text-center text-white px-4">
        <h1 className="text-2xl font-bold mb-4">{t('campaignNotFound')}</h1>
        <p className="text-white/80 mb-6">{t('campaignNotFoundDescription')}</p>
        <Link href="/campagnes" className="text-green-400 hover:text-green-300 font-medium underline">
          {t('backToCampaigns')}
        </Link>
      </div>
    </div>
  );
}
