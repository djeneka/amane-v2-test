'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import type { Locale } from '@/i18n/config';
import type { Campaign, CampaignActivity } from '@/data/mockData';
import type { CampaignTranslationsData, CampaignTranslationEntry } from '@/types/campaigns-translations';

import campaignsFr from '../../messages/campaigns-fr.json';
import campaignsEn from '../../messages/campaigns-en.json';

const dataByLocale: Record<Locale, CampaignTranslationsData> = {
  fr: campaignsFr as CampaignTranslationsData,
  en: campaignsEn as CampaignTranslationsData,
};

/** Campagne avec champs textuels pouvant être traduits (fallback sur les données API) */
export interface TranslatedCampaign {
  title: string;
  description: string;
  impact: string;
  process: string | null;
  location: string;
  beneficiariesList: string[];
  /** Activités avec title, description, result traduits */
  activities: Array<{
    id?: string;
    title?: string;
    description?: string;
    result?: string;
    amountSpent?: number;
    videos?: string[];
    images?: string[];
  }>;
}

function getEntry(data: CampaignTranslationsData, campaignId: string): CampaignTranslationEntry | undefined {
  return data.campaigns[campaignId];
}

function getTranslatedCampaignInner(
  data: CampaignTranslationsData,
  campaign: Campaign
): TranslatedCampaign {
  const entry = getEntry(data, campaign.id);
  const activities = campaign.activities ?? [];
  const translatedActivities = activities.map((a, index) => {
    const key = typeof a.id === 'string' ? a.id : `activity-${index}`;
    const act = entry?.activities?.[key];
    return {
      id: a.id,
      title: act?.title ?? a.title ?? '',
      description: act?.description ?? a.description ?? '',
      result: act?.result ?? a.result ?? '',
      amountSpent: a.amountSpent,
      videos: a.videos,
      images: a.images,
    };
  });
  return {
    title: entry?.title ?? campaign.title,
    description: entry?.description ?? campaign.description,
    impact: entry?.impact ?? campaign.impact ?? '',
    process: entry?.process ?? campaign.process ?? null,
    location: entry?.location ?? campaign.location ?? '',
    beneficiariesList: entry?.beneficiaries ?? campaign.beneficiariesList ?? [],
    activities: translatedActivities,
  };
}

interface CampaignTranslationsContextType {
  locale: Locale;
  /** Retourne les champs textuels de la campagne pour la locale courante (avec fallback sur les données API). */
  getTranslatedCampaign: (campaign: Campaign) => TranslatedCampaign;
  /** Texte pour une activité (titre, description ou result) avec fallback. */
  getActivityText: (
    campaignId: string,
    activity: CampaignActivity,
    activityIndex: number,
    field: 'title' | 'description' | 'result'
  ) => string;
}

const CampaignTranslationsContext = createContext<CampaignTranslationsContextType | undefined>(undefined);

export function CampaignTranslationsProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const data = dataByLocale[locale.locale];

  const value = useMemo<CampaignTranslationsContextType>(() => ({
    locale: locale.locale,
    getTranslatedCampaign: (campaign: Campaign) => getTranslatedCampaignInner(data, campaign),
    getActivityText: (
      campaignId: string,
      activity: CampaignActivity,
      activityIndex: number,
      field: 'title' | 'description' | 'result'
    ) => {
      const entry = getEntry(data, campaignId);
      const key = typeof activity.id === 'string' ? activity.id : `activity-${activityIndex}`;
      const act = entry?.activities?.[key];
      const translated = act?.[field];
      if (translated !== undefined && translated !== '') return translated;
      const raw = activity[field];
      return typeof raw === 'string' ? raw : '';
    },
  }), [data, locale.locale]);

  return (
    <CampaignTranslationsContext.Provider value={value}>
      {children}
    </CampaignTranslationsContext.Provider>
  );
}

export function useCampaignTranslations(): CampaignTranslationsContextType {
  const ctx = useContext(CampaignTranslationsContext);
  if (!ctx) {
    throw new Error('useCampaignTranslations must be used within CampaignTranslationsProvider');
  }
  return ctx;
}

/** Hook pratique : retourne la campagne avec tous les champs textuels traduits pour la locale courante. */
export function useTranslatedCampaign(campaign: Campaign): TranslatedCampaign {
  const { getTranslatedCampaign } = useCampaignTranslations();
  return getTranslatedCampaign(campaign);
}
