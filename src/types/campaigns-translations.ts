/**
 * Structure des traductions dynamiques des campagnes (option B).
 * Un fichier par locale : messages/campaigns-fr.json, messages/campaigns-en.json
 */

export interface CampaignActivityTranslation {
  title?: string;
  description?: string;
  result?: string;
}

export interface CampaignTranslationEntry {
  title?: string;
  description?: string;
  impact?: string;
  process?: string;
  location?: string;
  beneficiaries?: string[];
  activities?: Record<string, CampaignActivityTranslation>;
}

export interface CampaignTranslationsData {
  campaigns: Record<string, CampaignTranslationEntry>;
}
