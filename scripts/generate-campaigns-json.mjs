/**
 * Script pour générer messages/campaigns-fr.json et messages/campaigns-en.json
 * à partir des réponses API (liste campagnes + détail par campagne).
 *
 * Usage:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000 node scripts/generate-campaigns-json.mjs
 *   ou définir NEXT_PUBLIC_API_URL dans .env.local à la racine du projet.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function loadEnv() {
  try {
    const envPath = join(rootDir, '.env.local');
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*NEXT_PUBLIC_API_URL\s*=\s*(.+?)\s*$/);
      if (m) {
        const v = m[1].replace(/^["']|["']$/g, '').trim();
        if (v && !process.env.NEXT_PUBLIC_API_URL) process.env.NEXT_PUBLIC_API_URL = v;
        break;
      }
    }
  } catch (_) {
    // .env.local optionnel
  }
}

const baseUrl = () => {
  const u = process.env.NEXT_PUBLIC_API_URL || '';
  return u.replace(/\/$/, '');
};

async function apiGet(path) {
  const url = path.startsWith('http') ? path : `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

function buildCampaignEntry(api) {
  const activities = Array.isArray(api.activities)
    ? api.activities.reduce((acc, a, index) => {
        const key = typeof a.id === 'string' ? a.id : `activity-${index}`;
        acc[key] = {
          ...(typeof a.title === 'string' && a.title ? { title: a.title } : {}),
          ...(typeof a.description === 'string' && a.description ? { description: a.description } : {}),
          ...(typeof a.result === 'string' && a.result ? { result: a.result } : {}),
        };
        return acc;
      }, {})
    : {};
  return {
    title: api.title ?? '',
    description: api.description ?? '',
    impact: api.goals ?? '',
    process: api.process ?? '',
    location: api.location ?? '',
    beneficiaries: Array.isArray(api.beneficiaries)
      ? api.beneficiaries.filter((b) => typeof b === 'string')
      : [],
    ...(Object.keys(activities).length > 0 ? { activities } : {}),
  };
}

async function main() {
  loadEnv();
  const apiBase = baseUrl();
  if (!apiBase) {
    console.error('Définir NEXT_PUBLIC_API_URL (ou dans .env.local).');
    process.exit(1);
  }
  console.log('API base:', apiBase);

  const list = await apiGet('/api/campaigns?status=ACTIVE');
  const campaigns = Array.isArray(list) ? list : [];
  console.log(`Campagnes actives: ${campaigns.length}`);

  const campaignsFr = { campaigns: {} };
  const campaignsEn = { campaigns: {} };

  for (const api of campaigns) {
    if (!api?.id) continue;
    try {
      const detail = await apiGet(`/api/campaigns/${api.id}`);
      const entry = buildCampaignEntry(detail);
      campaignsFr.campaigns[api.id] = entry;
      campaignsEn.campaigns[api.id] = { ...entry };
    } catch (e) {
      const entry = buildCampaignEntry(api);
      campaignsFr.campaigns[api.id] = entry;
      campaignsEn.campaigns[api.id] = { ...entry };
      console.warn(`Détail ${api.id} non chargé, utilisation liste:`, e.message);
    }
  }

  const messagesDir = join(rootDir, 'messages');
  const frPath = join(messagesDir, 'campaigns-fr.json');
  const enPath = join(messagesDir, 'campaigns-en.json');
  writeFileSync(frPath, JSON.stringify(campaignsFr, null, 2), 'utf8');
  writeFileSync(enPath, JSON.stringify(campaignsEn, null, 2), 'utf8');
  console.log('Écrit:', frPath);
  console.log('Écrit:', enPath);
  console.log('Pour la locale EN, remplacer le contenu par les traductions puis relancer si besoin.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
